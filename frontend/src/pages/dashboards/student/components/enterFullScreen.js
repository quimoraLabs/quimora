// enterFullScreen.js

// Screen full karne ke liye controller helper function
export const enterFullScreen = () => {
  const element = document.documentElement;

  // Pehle check karein ki kahin pehle se full screen to nahi hai
  if (
    !document.fullscreenElement &&
    !document.webkitFullscreenElement &&
    !document.mozFullScreenElement &&
    !document.msFullscreenElement
  ) {
    if (element.requestFullscreen) {
      element
        .requestFullscreen()
        .catch((err) => console.log("Error entering fullscreen:", err));
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
};

// Full screen exit karne ke liye function
export const exitFullScreen = () => {
  // CRITICAL CHECK: Sirf tabhi exit karein jab sach me koi element full screen par ho!
  const isFullScreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  if (isFullScreen) {
    if (document.exitFullscreen) {
      document
        .exitFullscreen()
        .catch((err) => console.log("Error exiting fullscreen:", err));
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
};
