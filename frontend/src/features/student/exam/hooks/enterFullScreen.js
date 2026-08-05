// enterFullScreen.js

// Helper function to enter fullscreen mode.
export const enterFullScreen = () => {
  const element = document.documentElement;

  // First check whether fullscreen is already active.
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

// Function to exit fullscreen mode.
export const exitFullScreen = () => {
  // CRITICAL CHECK: Only exit fullscreen when an element is actually in fullscreen mode.
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
