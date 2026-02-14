"use client";

import { useEffect, useState } from "react";
import { saveToken, parseJwt } from "@/lib/auth";

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Tweets & pagination
  const [tweetsPage, setTweetsPage] = useState(0);
  const [tweets, setTweets] = useState([]);
  const [tweetsTotalPages, setTweetsTotalPages] = useState(1);
  const [tweetsLoading, setTweetsLoading] = useState(false);

  // Flagged
  const [flaggedPage, setFlaggedPage] = useState(0);
  const [flaggedTweets, setFlaggedTweets] = useState([]);
  const [flaggedTotalPages, setFlaggedTotalPages] = useState(1);
  const [flaggedLoading, setFlaggedLoading] = useState(false);

  // Criteria
  const [criteria, setCriteria] = useState([]);
  const [criteriaLoading, setCriteriaLoading] = useState(false);

  const [showNewCriteriaForm, setShowNewCriteriaForm] = useState(false);
  const [newCriteriaName, setNewCriteriaName] = useState("");
  const [newCriteriaList, setNewCriteriaList] = useState("");
  const [criteriaNotification, setCriteriaNotification] = useState("");
  const [criteriaNotificationType, setCriteriaNotificationType] = useState("success");

  // Initialize token and handle URL params
  useEffect(() => {
    // Get token from localStorage (only runs on client)
    const storedToken = localStorage.getItem("token");
    
    // Check for token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    
    if (tokenFromUrl) {
      saveToken(tokenFromUrl);
      setToken(tokenFromUrl);
      window.history.replaceState({}, document.title, "/dashboard");
    } else if (storedToken) {
      setToken(storedToken);
    } else {
      // No token found, redirect to login
      window.location.href = "/login";
    }
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (!token) return;
    
    if (activeTab === "tweets") fetchTweets(tweetsPage);
    if (activeTab === "flagged") fetchFlaggedTweets(flaggedPage);
    if (activeTab === "criteria") fetchCriteria();
  }, [activeTab, token, tweetsPage, flaggedPage]);

  // Fetch functions
  const fetchTweets = async (page = 0) => {
    setTweetsLoading(true);
    try {
      const res = await fetch(`https://ec2-13-62-105-226.eu-north-1.compute.amazonaws.com:8443/v1/api/tweets?page=${page}&size=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTweets(data.content || []);
      setTweetsTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setTweetsLoading(false);
    }
  };

  const fetchFlaggedTweets = async (page = 0) => {
    setFlaggedLoading(true);
    try {
      const res = await fetch(`https://ec2-13-62-105-226.eu-north-1.compute.amazonaws.com:8443/v1/api/tweets/flagged?page=${page}&size=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFlaggedTweets(data.content || []);
      setFlaggedTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setFlaggedLoading(false);
    }
  };

  const fetchCriteria = async () => {
    setCriteriaLoading(true);
    try {
      const res = await fetch("https://ec2-13-62-105-226.eu-north-1.compute.amazonaws.com:8443/v1/api/tweets/criteria", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const normalized = (data || []).map((c) => ({
        ...c,
        keywords: Array.isArray(c.criteriaList) ? c.criteriaList : [],
      }));
      setCriteria(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setCriteriaLoading(false);
    }
  };

  // Upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file first.");
      return;
    }
    setUploadError("");
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", selectedFile);
    const userId = token ? parseJwt(token).userId : "";
    formData.append("userId", userId);
    formData.append("bucketName", "your-bucket-name");
    formData.append("keyName", selectedFile.name);
    formData.append("contentLength", selectedFile.size.toString());
    formData.append("contentType", selectedFile.type);

    try {
      const s3Response = await fetch("https://ec2-13-62-105-226.eu-north-1.compute.amazonaws.com:8443/v1/api/s3/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!s3Response.ok) {
        const err = await s3Response.json();
        setUploadStatus("Upload failed: " + (err.error || s3Response.statusText));
        return;
      }

      setUploadStatus("Upload complete! Import job started. You'll get an email when it's ready.");

      const jobResponse = await fetch("https://ec2-13-62-105-226.eu-north-1.compute.amazonaws.com:8443/v1/api/tweets/upload-job", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!jobResponse.ok) {
        const err = await jobResponse.json();
        setUploadStatus("Import job failed: " + (err.error || jobResponse.statusText));
        return;
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("Something went wrong. Please try again.");
    }
  };

  // Criteria Analysis
  const startAnalysis = async (name, keywords) => {
    try {
      const res = await fetch("https://ec2-13-62-105-226.eu-north-1.compute.amazonaws.com:8443/v1/api/tweets/analysis-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ criteriaName: name, criteriaList: keywords }),
      });
      if (res.ok) {
        setCriteriaNotification("Analysis started! You'll receive an email when complete.");
        setCriteriaNotificationType("success");
      } else {
        setCriteriaNotification("Failed to start analysis");
        setCriteriaNotificationType("error");
      }
    } catch (err) {
      setCriteriaNotification("Error starting analysis");
      setCriteriaNotificationType("error");
    } finally {
      setTimeout(() => setCriteriaNotification(""), 5000);
    }
  };

  const handleCreateNewCriteria = async () => {
    if (!newCriteriaName.trim() || !newCriteriaList.trim()) {
      setCriteriaNotification("Please enter both name and keywords");
      setCriteriaNotificationType("error");
      setTimeout(() => setCriteriaNotification(""), 5000);
      return;
    }

    const keywords = newCriteriaList.split(",").map((k) => k.trim()).filter(Boolean);
    await startAnalysis(newCriteriaName, keywords);
    fetchCriteria();
    setShowNewCriteriaForm(false);
    setNewCriteriaName("");
    setNewCriteriaList("");
  };

  // Delete handler for flagged tweets
  const handleDeleteTweet = async (tweetId) => {
    if (!confirm("Are you sure you want to delete this tweet?")) return;
    try {
      const res = await fetch(`https://ec2-13-62-105-226.eu-north-1.compute.amazonaws.com:8443/v1/api/tweets/${tweetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchFlaggedTweets(flaggedPage);
    } catch (err) {
      console.error(err);
      alert("Failed to delete tweet");
    }
  };

  // Render tweet tables
  const renderTweetTable = (items, isFlagged = false) => {
    const loading = isFlagged ? flaggedLoading : tweetsLoading;
    const page = isFlagged ? flaggedPage : tweetsPage;
    const setPage = isFlagged ? setFlaggedPage : setTweetsPage;
    const totalPages = isFlagged ? flaggedTotalPages : tweetsTotalPages;

    if (loading) return <div className="text-center py-16 text-gray-500">Loading tweets...</div>;
    if (!items?.length) return <div className="text-center py-16 text-gray-500">No tweets found.</div>;

    return (
      <div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Content</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {items.map((tweet, index) => (
                <tr key={tweet.tweetId || index} className="hover:bg-indigo-50/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tweet.tweetId}</td>
                  <td className="px-6 py-4 max-w-2xl"><p className="text-sm text-gray-900 line-clamp-2">{tweet.cleanedTweet}</p></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(tweet.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${tweet.deleteFlag ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                      {tweet.deleteFlag ? "Flagged" : "Safe"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <a href={`https://x.com/i/status/${tweet.tweetId}`} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition">View Tweet</a>
                    {isFlagged && (
                      <button onClick={() => handleDeleteTweet(tweet.tweetId)} className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 bg-indigo-200 rounded hover:bg-indigo-300 disabled:opacity-50 transition">Previous</button>
          <span className="text-sm text-gray-700">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page + 1 >= totalPages} className="px-4 py-2 bg-indigo-200 rounded hover:bg-indigo-300 disabled:opacity-50 transition">Next</button>
        </div>
      </div>
    );
  };

  // Show loading while token is being initialized
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Analyzer Dashboard</h1>
          <span className="text-sm text-gray-600 hidden sm:block">Welcome back</span>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white shadow-sm border border-gray-200 p-1.5">
            {["upload", "tweets", "flagged", "criteria"].map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${activeTab === t ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                {t === "upload" ? "Upload Data" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 lg:p-8">
            {activeTab === "upload" && (
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 text-center">Upload Your Twitter Archive</h2>
                <p className="text-gray-600 text-center">Select your Twitter data export (JSON or ZIP file)</p>
                <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors group ${selectedFile ? "border-indigo-500 bg-indigo-50/40" : "border-gray-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/20"}`}>
                  <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                  <div className="text-center p-6">
                    <p className="mt-4 text-gray-700 font-medium">{selectedFile ? selectedFile.name : "Click or drag file here"}</p>
                    {selectedFile && <p className="mt-1 text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>}
                  </div>
                </label>
                <button onClick={handleFileUpload} disabled={!selectedFile} className={`w-full py-3 px-6 rounded-xl font-semibold text-white ${selectedFile ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg" : "bg-gray-300 cursor-not-allowed"} transition-all`}>Start Upload & Processing</button>
                {uploadStatus && <div className={`p-4 rounded-xl text-center ${uploadStatus.toLowerCase().includes("failed") || uploadStatus.includes("error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>{uploadStatus}</div>}
                {uploadError && <p className="text-red-600 text-center font-medium">{uploadError}</p>}
              </div>
            )}

            {activeTab === "tweets" && renderTweetTable(tweets)}
            {activeTab === "flagged" && renderTweetTable(flaggedTweets, true)}

            {activeTab === "criteria" && (
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Create New Criteria</h3>
                    <button onClick={() => setShowNewCriteriaForm(!showNewCriteriaForm)} className="text-indigo-600 hover:text-indigo-800 font-medium">
                      {showNewCriteriaForm ? "Cancel" : "+ Add New"}
                    </button>
                  </div>

                  {showNewCriteriaForm && (
                    <div className="space-y-4">
                      <input type="text" placeholder="Criteria Name" value={newCriteriaName} onChange={(e) => setNewCriteriaName(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-gray-900"/>
                      <textarea placeholder="Keywords, comma separated" value={newCriteriaList} onChange={(e) => setNewCriteriaList(e.target.value)} className="w-full px-4 py-2 border rounded-lg resize-none text-gray-900"/>
                      <button onClick={handleCreateNewCriteria} className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">Start Analysis</button>
                    </div>
                  )}

                  {criteriaNotification && (
                    <div className={`mt-4 p-3 rounded-lg text-center border ${criteriaNotificationType === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {criteriaNotification}
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Keywords</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {criteria.map((c, index) => (
                        <tr key={c.criteriaId || index} className="hover:bg-indigo-50/40 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.criteriaName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{(c.keywords || []).join(", ")}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="mt-2">
                              <button
                                onClick={() => startAnalysis(c.criteriaName, c.keywords)}
                                className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                              >
                                Re-analyze
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {criteriaLoading && <tr><td colSpan={3} className="text-center py-4 text-gray-500">Loading criteria...</td></tr>}
                      {!criteriaLoading && criteria.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-gray-500">No criteria found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}