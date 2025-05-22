// utils/formatMentions.js
import axios from 'axios';

export async function formatMentions(text) {
  const mentionRegex = /@([\p{L}\p{N}_]+)(?=\s|$)/gu;
  const matches = Array.from(text.matchAll(mentionRegex));
  let newText = text;

  for (const match of matches.reverse()) {
    const username = match[1];
    try {
       // console.log('2222',username);

      const res = await axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/users/getUserId/${username}`);
      const userId = res.data.id;
      //console.log('2222',userId,username);

      const mentionHtml = `<span class="mention" data-userid="${userId}">@${username}</span>`;
      newText = newText.slice(0, match.index) + mentionHtml + newText.slice(match.index + match[0].length);
    } catch (err) {
      console.error(`유저 정보 가져오기 실패: @${username}`);
    }
  }

  return newText;
}
