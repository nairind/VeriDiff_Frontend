// /utils/scrollUtils.js
export const createScrollManager = () => {
  let scrollPositionRef = 0;
  let shouldScrollToResults = false;

  const preserveScroll = () => {
    scrollPositionRef = window.pageYOffset || document.documentElement.scrollTop;
  };

  const restoreScroll = () => {
    if (scrollPositionRef > 0 && !shouldScrollToResults) {
      window.scrollTo(0, scrollPositionRef);
    }
  };

  const scrollToResults = () => {
    shouldScrollToResults = true;
    setTimeout(() => {
      scrollPositionRef = 0;
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      shouldScrollToResults = false;
    }, 100);
  };

  return { preserveScroll, restoreScroll, scrollToResults };
};
