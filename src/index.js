function setCookie(
    name,
    value,
    {
        secure = true,
        path = '/',
        domain = 'example.com',
        expires = new Date(Date.now() + 36000000),
    },
) {
    console.log(secure, path, domain, expires);
}

setCookie('type', 'js', {}); //true "/" "example.com" Tue Jun 30 2020 17:34:50 GMT+0800 (中国标准时间)
