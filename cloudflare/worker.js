'use strict';

const ASSET_URL = 'https://docker-proxy-elj.pages.dev/';
const PREFIX = '/';
const Config = {
    jsdelivr: 0
};

const BACKENDS = [
    'https://crproxy.2huo.us',
    'https://hk.ajx.cc',
    'http://hk.jnz.me',
    'https://docker.master-jsx.top',
    'https://docker.shuailong.asia',
    'https://dockerhubproxy.hk.chenhuangke.space',
    'https://sg.hub.1co.live',
    'https://hk.hub.1co.live',
    'https://docker.xyu.homes',
    'https://mirrors.yy0.top',
    'https://docker.t-ttt.cn'
];

const DOCKER_REPOS_REGEX = new RegExp('^/v2/(docker\\.io|gcr\\.io|ghcr\\.io|k8s\\.gcr\\.io|registry\\.k8s\\.io|quay\\.io|mcr\\.microsoft\\.com|docker\\.elastic\\.co|nvcr\\.io|registry\\.jujucharms\\.com|cr\\.l5d\\.io)/');

const exp1 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:releases|archive)\/.*$/i;
const exp2 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:blob|raw)\/.*$/i;
const exp3 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:info|git-).*$/i;
const exp4 = /^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+?\/.+$/i;
const exp5 = /^(?:https?:\/\/)?gist\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+$/i;
const exp6 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/tags.*$/i;
const expStaticAssets = /\.(?:js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/i;

const PREFLIGHT_INIT = {
    status: 204,
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
};

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
    const request = event.request;
    const url = new URL(request.url);

    let path = url.searchParams.get('q');
    if (path) {
        return Response.redirect('https://' + url.host + PREFIX + path, 301);
    }
    path = url.href.substr(url.origin.length + PREFIX.length).replace(/^https?:\/+/, 'https://');

    if (path.search(expStaticAssets) !== -1) {
        return fetch(ASSET_URL + path);
    }

    if (path.search(exp1) === 0 || path.search(exp5) === 0 || path.search(exp6) === 0 || path.search(exp3) === 0 || path.search(exp4) === 0) {
        return httpHandler(request, path);
    } else if (path.search(exp2) === 0) {
        if (Config.jsdelivr) {
            const newUrl = path.replace('/blob/', '@').replace(/^(?:https?:\/\/)?github\.com/, 'https://cdn.jsdelivr.net/gh');
            return Response.redirect(newUrl, 302);
        } else {
            path = path.replace('/blob/', '/raw/');
            return httpHandler(request, path);
        }
    }

    if (DOCKER_REPOS_REGEX.test(url.pathname)) {
        const backend = getRandomBackend();
        const newUrl = new URL(url.pathname + url.search, backend);
        let newRequest = new Request(newUrl, request);
        newRequest.headers.set('Host', url.hostname);
        newRequest.headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP'));
        newRequest.headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP'));
        newRequest.headers.set('X-Forwarded-Proto', url.protocol.slice(0, -1));
        let response = await fetch(newRequest);

        if (response.status === 404 && !DOCKER_REPOS_REGEX.test(url.pathname)) {
            const newBackend = getRandomBackend();
            const newUrl = new URL(url.pathname + url.search, newBackend);
            newRequest = new Request(newUrl, request);
            response = await fetch(newRequest);
        }

        response = new Response(response.body, response);
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('X-Frame-Options', 'SAMEORIGIN');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
        response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://hm.baidu.com https://hmcdn.baidu.com; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://at.alicdn.com; img-src 'self' data: https:; connect-src 'self' https://www.googletagmanager.com https://hm.baidu.com https://hmcdn.baidu.com https://www.google-analytics.com");

        return response;
    }

    // Handle GitHub-related requests with a fallback to BACKENDS on 404
    const response = await fetch(ASSET_URL + path);
    if (response.status === 404) {
        const backend = getRandomBackend();
        const newUrl = new URL(path + url.search, backend);
        const newRequest = new Request(newUrl, request);
        const newResponse = await fetch(newRequest);
        return modifyResponseHeaders(newResponse);
    }

    return response;
}

function getRandomBackend() {
    const randomIndex = Math.floor(Math.random() * BACKENDS.length);
    return BACKENDS[randomIndex];
}

async function httpHandler(req, pathname) {
    const reqHdrRaw = req.headers;

    if (req.method === 'OPTIONS' && reqHdrRaw.has('access-control-request-headers')) {
        return new Response(null, PREFLIGHT_INIT);
    }

    const reqHdrNew = new Headers(reqHdrRaw);
    let urlStr = pathname;
    if (!urlStr.startsWith('https://')) {
        urlStr = 'https://' + urlStr;
    }
    const urlObj = newUrl(urlStr);

    const reqInit = {
        method: req.method,
        headers: reqHdrNew,
        redirect: 'manual',
        body: req.body
    };
    return proxy(urlObj, reqInit);
}

async function proxy(urlObj, reqInit) {
    const res = await fetch(urlObj.href, reqInit);
    const resHdrOld = res.headers;
    const resHdrNew = new Headers(resHdrOld);
    const status = res.status;

    if (resHdrNew.has('location')) {
        let _location = resHdrNew.get('location');
        if (checkUrl(_location))
            resHdrNew.set('location', PREFIX + _location);
        else {
            reqInit.redirect = 'follow';
            return proxy(newUrl(_location), reqInit);
        }
    }
    
    resHdrNew.set('access-control-expose-headers', '*');
    resHdrNew.set('access-control-allow-origin', '*');
    resHdrNew.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS');
    resHdrNew.set('access-control-allow-headers', '*');

    resHdrNew.delete('content-security-policy');
    resHdrNew.delete('content-security-policy-report-only');
    resHdrNew.delete('clear-site-data');

    return new Response(res.body, {
        status,
        headers: resHdrNew,
    });
}

function checkUrl(u) {
    for (let i of [exp1, exp2, exp3, exp4, exp5, exp6]) {
        if (u.search(i) === 0) {
            return true;
        }
    }
    return false;
}

function newUrl(urlStr) {
    try {
        return new URL(urlStr);
    } catch (err) {
        return null;
    }
}

function modifyResponseHeaders(response) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('access-control-expose-headers', '*');
    newHeaders.set('access-control-allow-origin', '*');
    newHeaders.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS');
    newHeaders.set('access-control-allow-headers', '*');

    newHeaders.delete('content-security-policy');
    newHeaders.delete('content-security-policy-report-only');
    newHeaders.delete('clear-site-data');

    return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
    });
}
