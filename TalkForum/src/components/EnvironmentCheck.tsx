const EnvrionmentCheck = () => {
    document.cookie = 'test=test';
    if (document.cookie.indexOf('test=') === -1) {
        alert('Please enable cookies to use this website!');
    }
    // 阻止IE浏览器访问 No IE Thank you!
    if (navigator.userAgent.indexOf('MSIE') > 0) {
        alert('Please use a modern browser to use this website!No Internet Explorer, thank you!');
        window.location.href = 'https://www.google.com/chrome/';
    }
    return null;
};

export default EnvrionmentCheck;