/**
 * Author      : Jefri Herdi Triyanto
 * Description : mengirimkan data
 */

const fetch = async (...args) => {
    // eslint-disable-next-line no-shadow
    const { default: fetch } = await import('node-fetch');
    return await fetch(...args);
};

const getText = async ({ url, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        method: 'GET',
    })
        .catch((error) => {
            return console.log(error);
        })
        .then((res) => {
            return res.text();
        });
};
const getJson = async ({ url, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        method: 'GET',
    })
        .catch((error) => {
            return console.log(error);
        })
        .then((res) => {
            return res.json();
        });
};

const postText = async ({ url, data = {}, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
        method: 'POST',
    })
        .catch((error) => {
            return console.log(error);
        })
        .then((res) => {
            return res.text();
        });
};
const postJson = async ({ url, data = {}, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
        method: 'POST',
    })
        .catch((error) => {
            return console.log(error);
        })
        .then((res) => {
            return res.json();
        });
};

const putText = async ({ url, data = {}, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
        method: 'PUT',
    }).then((res) => {
        return res.text();
    });
};
const putJson = async ({ url, data = {}, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
        method: 'PUT',
    }).then((res) => {
        return res.json();
    });
};

const deleteText = async ({ url, data = {}, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
        method: 'DELETE',
    }).then((res) => {
        return res.text();
    });
};
const deleteJson = async ({ url, data = {}, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
        method: 'DELETE',
    }).then((res) => {
        return res.json();
    });
};

// =========================
const customMethodText = async ({ url, method, data = {}, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
        method,
    }).then((res) => {
        return res.text();
    });
};
const customMethodJson = async ({ url, method, data = {}, headers = {} }) => {
    return await fetch(url, {
        headers: {
            'User-Agent': 'okhttp/4.5.0',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
        method,
    }).then((res) => {
        return res.json();
    });
};

module.exports = {
    getText,
    getJson,

    postJson,
    postText,

    putText,
    putJson,

    deleteText,
    deleteJson,

    customMethodText,
    customMethodJson,
};
