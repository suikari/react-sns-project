import React from 'react';
import { Typography, Box } from '@mui/material';

const StoryGallery = ({ stories, openModalWithStoryId }) => {
  return (
    <>
      <Typography component="div" variant="h6" mt={3}>
        내 스토리 목록
      </Typography>

      <Box mt={3} display="flex" flexWrap="wrap" gap={2}>
        {stories.map((story, index) => (
          <Box
            key={index}
            onClick={() => openModalWithStoryId(story.storyId)}
            position="relative"
            width="calc(25% - 16px)"
            height="200px"
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover .story-content': {
                opacity: 1,
              },
            }}
          >
            {story.mediaType === 'image' ? (
              <img
                src={story.mediaPath}
                alt={story.caption}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            ) : story.mediaType === 'video' ? (
              <video
                src={story.mediaPath}
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            ) : (
              <Typography color="error">지원되지 않는 미디어 형식</Typography>
            )}

            <Box
              className="story-content"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                opacity: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                borderRadius: '8px',
                transition: 'opacity 0.3s ease',
              }}
            >
              <Typography variant="body2" align="center">
                {story.caption}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default StoryGallery;
