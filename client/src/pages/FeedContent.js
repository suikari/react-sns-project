import React, { useEffect, useState } from 'react';
import { formatMentions } from '../utils/formatMentions';
import { useNavigate } from 'react-router-dom';

function FeedContent({ text }) {
  const [htmlContent, setHtmlContent] = useState('');
  const navigate = useNavigate(); // 페이지 이동을 위한 함수 리턴

  useEffect(() => {
    let isMounted = true;
    formatMentions(text).then((result) => {
      if (isMounted) setHtmlContent(result);
    });
    return () => { isMounted = false };
  }, [text]);


    useEffect(() => {
      const handleClick = (e) => {
        if (e.target.classList.contains('mention')) {
          const userid= e.target.dataset.userid;
          navigate(`/userpage/${userid}`);
        }
      };
    
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }, []);
    
  return (
    <div
      className="feed-text"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export default FeedContent;