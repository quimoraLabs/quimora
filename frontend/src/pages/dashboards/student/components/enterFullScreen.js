// Screen full karne ke liye controller helper function
export const enterFullScreen = () => {
  const element = document.documentElement; // Isse poori body full screen ho jayegi

  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) { // Firefox support configuration fallback
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera support
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { // IE/Edge legacy support
    element.msRequestFullscreen();
  }
};

// Full screen exit karne ke liye function
export const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};
