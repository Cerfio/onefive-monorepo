const formatNotification = (text: string) => {
  return text.replace(/<b>(.*?)<\/b>/g, '<b class="text-[#6941C6]">$1</b>');
};

export default formatNotification;
