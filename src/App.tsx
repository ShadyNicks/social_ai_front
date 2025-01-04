import { useEffect, useState } from "react";
import { MessageCircle, SendHorizonal } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { ref, onValue, Database, DatabaseReference } from "firebase/database";
import { db } from "../config.ts";

interface Comment {
  commentId: string;
  commentText: string;
  commentedAt: string;
}

interface Content {
  content: string;
  createdAt: string;
  postId: string;
  likes: number;
  comments: Comment[];
}

function App() {
  const [content, setContent] = useState("");
  const [contentList, setContentList] = useState<Content[]>([]);

  // const [contentList, setContentList] = useState<Content[]>([
  //   {
  //     comments: [
  //       {
  //         commentedAt: "13th Jan, 2024",
  //         commentId: "oimfCI7O3WTVRQO",
  //         commentText: "kya baat h bapu",
  //       },
  //       {
  //         commentedAt: "13th Jan, 2024",
  //         commentId: "oimfCadjlavdsO3WTVRQO",
  //         commentText: "Well well well, here we go again",
  //       },
  //     ],
  //     createdAt: "12th Januray, 5:30 PM, 2026",
  //     content:
  //       "THis is just a normal content right, and this will be great all the time ok.",
  //     likes: 0,
  //     postId: "137botnglism",
  //   },
  //   {
  //     comments: [],
  //     createdAt: "12th Januray, 5:30 PM, 2026",
  //     content:
  //       "THis is just a normal content right, and this will be great all the time ok.",
  //     likes: 0,
  //     postId: "137bogbkglism",
  //   },
  // ]);
  const [loader, setLoader] = useState(false);
  const [showComment, setShowComment] = useState<string[]>([]);

  const [database] = useState<Database>(db);
  const [contentRef] = useState<DatabaseReference>(
    ref(database, "media-data/" + localStorage.getItem("userId") + "/")
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      const userId = "user-" + uuidv4();
      localStorage.setItem("userId", userId);
    }
  }, []);

  // useEffect(() => {
  //   if (database && contentRef) {
  //     get(contentRef)
  //       .then((snapshot) => {
  //         if (snapshot.exists()) {
  //           console.log(snapshot.val());
  //           Object.keys(snapshot.val()).forEach((key) => {
  //             console.log(snapshot.val()[key]);
  //             setContentList((prev) => [
  //               ...prev,
  //               { ...snapshot.val()[key], postId: key },
  //             ]);
  //           });
  //         } else {
  //           console.log("No data available");
  //         }
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //       });
  //   }
  // }, [database, contentRef]);

  useEffect(() => {
    const unsubscribe = onValue(contentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newContent = Object.keys(data).map((postId) => ({
          postId,
          comments: data[postId].comments || [],
          content: data[postId].content,
          createdAt: data[postId].createdAt,
          likes: data[postId].likes,
        }));

        setContentList((prevList) => {
          const existingPosts = new Map(
            prevList.map((post) => [post.postId, post])
          );

          const updatedContent = newContent.map((newPost) => {
            const existingPost = existingPosts.get(newPost.postId);

            if (
              existingPost &&
              JSON.stringify(existingPost) !== JSON.stringify(newPost)
            ) {
              return newPost;
            }
            return existingPost || newPost;
          });

          if (JSON.stringify(prevList) === JSON.stringify(updatedContent)) {
            return prevList;
          }

          return updatedContent;
        });
      } else {
        setContentList([]);
      }
    });

    return () => unsubscribe();
  }, [contentRef]);

  const handlePostContent = async () => {
    if (content) {
      setLoader(true);

      const postId = uuidv4();
      // const createdAt = Date();

      const date = new Date();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const createdAt = `${day}-${month}-${year}`;

      setContentList((prev) => [
        ...prev,
        {
          content: content.trim(),
          createdAt,
          postId,
          comments: [],
          likes: 0,
        },
      ]);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        content: content.trim(),
        userId: localStorage.getItem("userId"),
        postId,
        createdAt,
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };

      const url = "https://social-ai-eta.vercel.app/api/post-text";
      // const localurl = "http://localhost:8000/api/post-text"

      fetch(url, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          setLoader(false);
        })
        .catch((error) => console.error(error));

      setContent("");
    }
  };

  const handleShowComments = (postId: string) => {
    if (!showComment.includes(postId))
      setShowComment((prev) => [...prev, postId]);
    else setShowComment((prev) => prev.filter((pId) => pId !== postId));
  };

  return (
    <div className="relative font-inter flex flex-col items-center justify-start w-full min-h-screen bg-[#202020] text-gray-100">
      {contentList.length !== 0 && (
        <div className="w-full md:w-[50%] gap-5 mt-5 flex flex-col items-start justify-start h-full overflow-y-auto">
          {contentList.map((content) => {
            return (
              <div
                key={content.postId}
                className="w-full flex flex-col gap-1 items-start justify-start p-3 rounded-lg"
              >
                <div className="bg-[#313131] flex w-full flex-col items-start justify-start shadow-lg p-3 rounded-lg">
                  <p>{content.content}</p>

                  <div className="flex items-center justify-between w-full mt-5">
                    <button
                      onClick={() => handleShowComments(content.postId)}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <p className="text-sm text-red-500">
                        {content.comments.length}
                      </p>
                    </button>
                    <p className="self-end text-xs text-gray-400">
                      {content.createdAt}
                    </p>
                  </div>
                </div>

                {showComment.includes(content.postId) && (
                  <div className="w-full border border-gray-700 h-80 overflow-y-auto rounded-lg shadow-lg p-3">
                    <h3 className="mb-2 font-semibold">Comments</h3>
                    {content.comments.map((comment) => {
                      return (
                        <div
                          key={comment.commentId}
                          className="w-full p-3 flex mb-1 flex-col items-start justify-start gap-1 rounded-lg bg-[#2c2c2c]"
                        >
                          <p className="text-sm">{comment.commentText}</p>
                          <p className="text-xs self-end text-gray-600">
                            {comment.commentedAt}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {loader && (
        <div className="p-4 rounded-lg border border-gray-600">Loading...</div>
      )}

      <div className="absolute z-10 shadow-lg gap-2 bottom-3 flex items-start justify-between border border-gray-500 bg-[#1b1b1b] p-2 rounded-lg w-[96%] md:w-[50%]">
        <textarea
          value={content}
          rows={3}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") handlePostContent();
          }}
          placeholder="Type your content here"
          className="px-4 py-3 w-full resize-none bg-transparent outline-none border-none text-gray-100"
        />
        <button
          onClick={handlePostContent}
          className="p-3 rounded-lg bg-green-600 hover:opacity-80 text-white"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default App;
