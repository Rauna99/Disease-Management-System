import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [chatVisible, setChatVisible] = useState(false); // starts hidden
  const [showHealthTips, setShowHealthTips] = useState(false);

  const chatContainerRef = useRef(null);

  const [patientProfile, setPatientProfile] = useState({
    age: 45,
    condition: "diabetic",
    bloodPressure: "130/85",
  });

  const getDailyHealthTips = async () => {
    setGeneratingAnswer(true);
    setShowHealthTips(true);

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: `Patient profile: Age ${patientProfile.age}, Condition: ${patientProfile.condition}, Blood Pressure: ${patientProfile.bloodPressure}. Give 3 friendly daily health tips and reminders.`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyByg9c-QL9cwB7sZ_jdNEcY_citWmSkPGM",
          },
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;

      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: aiResponse },
      ]);
    } catch (error) {
      console.error(error);
    }

    setGeneratingAnswer(false);
  };

  const cancelHealthTips = () => {
    setShowHealthTips(false);
    setChatHistory([]); // clear tips chat
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion("");

    setChatHistory((prev) => [
      ...prev,
      { type: "question", content: currentQuestion },
    ]);

    try {
      const response = await axios({
        method: "post",
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": "AIzaSyByg9c-QL9cwB7sZ_jdNEcY_citWmSkPGM",
        },
        data: {
          contents: [
            {
              parts: [
                {
                  text: question,
                },
              ],
            },
          ],
        },
      });

      const aiResponse =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: aiResponse },
      ]);
      setAnswer(aiResponse);
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer(false);
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-green-50 to-green-100">
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        {/* Homepage */}
        {!chatVisible && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="bg-green-50 rounded-xl p-8 max-w-2xl">
              <h2 className="text-4xl font-bold text-green-500 hover:text-green-600 transition-colors">
                Welcome to MedChat AI! 👋
              </h2>
              <p className="text-gray-600 mb-4">
                Click the chatbot icon to start chatting!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-green-500">🏋️ </span> Exercise &
                  Activity Advice
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-green-500">🥗</span> Healthy Eating &
                  Meal Plans
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-green-500">🍎</span> Food-Drug
                  Interaction Advice
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-green-500">🤔</span> General Knowledge
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        {chatVisible && !showHealthTips && (
          <header className="text-center py-4">
            <h1 className="text-4xl font-bold text-green-500 hover:text-green-600 transition-colors">
              Chat AI
            </h1>
            <button
              onClick={getDailyHealthTips}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-2"
            >
              Get Daily Health Tips
            </button>
          </header>
        )}

        {/* Health Tips Panel */}
        {chatVisible && showHealthTips && (
          <div className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-lg p-4 hide-scrollbar">
            {chatHistory.map((chat, index) => (
              <div key={index} className="mb-4 text-left">
                <div className="inline-block max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
                  <ReactMarkdown>{chat.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {generatingAnswer && (
              <div className="text-left">
                <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
                  Generating tips...
                </div>
              </div>
            )}
            <button
              onClick={cancelHealthTips}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Chat & Input Form */}
        {chatVisible && !showHealthTips && (
          <>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-lg p-4 hide-scrollbar"
            >
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-green-50 rounded-xl p-8 max-w-2xl">
                    <h2 className="text-4xl font-bold text-green-500 hover:text-green-600 transition-colors">
                      Welcome to MedChat AI! 👋
                    </h2>
                    <p className="text-gray-600 mb-4">
                      I'm here to help you with anything you'd like to know. You
                      can ask me about:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="text-green-500">🏋️ </span> Exercise &
                        Activity Advice
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="text-green-500">🥗</span> Healthy
                        Eating & Meal Plans
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="text-green-500">🍎</span> Food-Drug
                        Interaction Advice
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="text-green-500">🤔</span> General
                        Knowledge
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      chat.type === "question" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${
                        chat.type === "question"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <ReactMarkdown>{chat.content}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
              {generatingAnswer && (
                <div className="text-left">
                  <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={generateAnswer}
              className="bg-white rounded-lg shadow-lg p-4"
            >
              <div className="flex gap-2">
                <textarea
                  required
                  className="flex-1 border border-gray-300 rounded p-3 focus:border-green-400 focus:ring-1 focus:ring-green-400 resize-none"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything..."
                  rows="2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      generateAnswer(e);
                    }
                  }}
                ></textarea>
                <button
                  type="submit"
                  className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors ${
                    generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={generatingAnswer}
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}

        {/* Floating AI Icon */}
        <div className="fixed bottom-4 left-4 z-50">
          <button
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors"
            onClick={() => setChatVisible((prev) => !prev)}
          >
            🤖
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
