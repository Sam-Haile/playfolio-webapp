// utils/getEmbedUrl.js
export const getEmbedUrl = (video) => {
    if (!video) return null;
  
    // ① YouTube ID (just 11 chars, no "http")
    if (!video.video_id.startsWith("http")) {
      return `https://www.youtube.com/embed/${video.video_id}`;
    }
  
    // ② Already a full URL → leave unchanged (Twitch, Vimeo, etc.)
    return video.video_id;
  };
  