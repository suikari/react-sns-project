# SNS 웹 애플리케이션

이 프로젝트는 React, MUI, Node.js, Express, MySQL을 기반으로 구현된 SNS 플랫폼입니다.  
사용자는 피드를 작성하고, 댓글을 달며, 실시간 채팅 및 스토리 기능을 활용할 수 있습니다.  
심플하지만 확장 가능한 구조를 갖추고 있으며, UI/UX는 MUI를 기반으로 세련되게 디자인되었습니다.

---

## 기술 스택

| 프론트엔드 | 백엔드 | 데이터베이스 | 기타 라이브러리 |
|------------|--------|--------------|----------------|
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white&style=flat-square)<br>![MUI](https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white&style=flat-square) | ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=flat-square)<br>![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white&style=flat-square) | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square) | Socket.io, Multer, JWT, Axios 등 |


---

## 주요 기능 및 화면

> 각 기능별로 실제 UI 캡처 이미지를 함께 첨부했습니다.

---

### 1. 피드 보기

타임라인 방식으로 최신 피드를 확인할 수 있습니다.  
이미지, 동영상, 텍스트, 좋아요, 댓글 등이 포함됩니다.

![피드 보기](./screenshots/feed-view.png)

---

### 2. 피드 작성 및 수정

이미지와 텍스트를 포함한 게시글 작성이 가능하며, 수정/삭제도 지원합니다.

![피드 작성](./screenshots/feed-write.png)

---

### 3. 실시간 채팅

Socket.io를 활용하여 1:1 및 그룹 채팅이 가능합니다.  
읽음 표시, 파일 전송, 메시지 삭제, 알림 끄기 등을 지원합니다.

![채팅 기능](./screenshots/chat.png)

---

### 4. 알림 확인

좋아요, 댓글, 채팅 등의 이벤트에 대한 실시간 알림을 제공합니다.  
읽지 않은 알림은 상단에 표시됩니다.

![알림 기능](./screenshots/notification.png)

---

### 5. 사용자 검색

닉네임 또는 사용자 이름을 기반으로 실시간 검색이 가능합니다.

![검색 기능](./screenshots/search.png)

---

### 6. 스토리 보기

스토리는 15초 자동 전환, 수동 탐색, 작성자 표시, 전체화면 모달로 이루어진 구성입니다.

![스토리 보기](./screenshots/story.png)

---

### 7. 마이페이지

사용자 정보 수정, 내 피드 및 스토리 확인, 프로필 이미지 업로드 등  
개인 관리 기능을 제공합니다.

![마이페이지](./screenshots/mypage.png)

---

## 프로젝트 구조

