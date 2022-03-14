/**
 * JUMP-BOOT Documentation
 */

// ========================== Enumeration ========================== //
const StatusCode = {
    INFO: {
        // 1xx Information Responses
        CONTINUE: 100,
        SWITCHING_PROTOCOLS: 101,
        PROCESSING: 102,
        EARLY_HINTS: 103,
    },
    SUCCESS: {
        // 2xx Successful Responses
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NON_AUTHORITATIVE_INFORMATION: 203,
        NO_CONTENT: 204,
        RESET_CONTENT: 205,
        PARTIAL_CONTENT: 206,
        MULTI_STATUS: 207,
        ALREADY_REPORTED: 208,
        THIS_IS_FINE: 218, // Apache Web Server
        IM_USED: 226,
    },
    REDIRECT: {
        // 3xx Redirection Messages
        MULTIPLE_CHOICES: 300,
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        SEE_OTHER: 303,
        NOT_MODIFIED: 304,
        USE_PROXY: 305,
        SWITCH_PROXY: 306,
        TEMPORARY_REDIRECT: 307,
        PERMANENT_REDIRECT: 308,
    },
    CLIENT: {
        // 4xx Client Error Responses
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        PAYMENT_REQUIRED: 402,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        NOT_ACCEPTABLE: 406,
        PROXY_AUTHENTICATION_REQUIRED: 407,
        REQUEST_TIMEOUT: 408,
        CONFLICT: 409,
        GONE: 410,
        LENGTH_REQUIRED: 411,
        PRECONDITION_FAILED: 412,
        PAYLOAD_TOO_LARGE: 413,
        URI_TOO_LONG: 414,
        UNSUPPORTED_MEDIA_TYPE: 415,
        RANGE_NOT_SATISFIABLE: 416,
        EXPECTATION_FAILED: 417,
        IM_A_TEAPOT: 418,
        PAGE_EXPIRED: 419, // Laravel Framework
        METHOD_FAILURE: 420, // Spring Framework
        MISDIRECTED_REQUEST: 421,
        UNPROCESSABLE_ENTITY: 422,
        LOCKED: 423,
        FAILED_DEPENDENCY: 424,
        TOO_EARLY: 425,
        UPGRADE_REQUIRED: 426,
        PRECONDITION_REQUIRED: 428,
        TOO_MANY_REQUEST: 429,
        // eslint-disable-next-line id-length
        REQUEST_HEADERS_FIELDS_TOO_LARGE_SHOPIFY: 430, // Shopify
        REQUEST_HEADERS_FIELDS_TOO_LARGE: 431,
        LOGIN_TIME_OUT: 440, // IIS
        NO_RESPONSE: 449, // NGINX
        RETRY_WITH: 449, // IIS
        // eslint-disable-next-line id-length
        BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS: 450, // Microsoft
        UNAVAILABLE_FOR_LEGAL_REASONS: 451,
        CLIENT_CLOSED_CONNECTION: 460, // AWS ELB
        REQUEST_HEADER_TOO_LARGE: 494, // NGINX
        SSL_CERTIFICATE_ERROR: 495, // NGINX
        SSL_CERTIFICATE_REQUIRED: 496, // NGINX
        HTTP_REQUEST_SENT_TO_HTTPS_PORT: 497, // NGINX
        CLIENT_CLOSED_REQUEST: 499, // NGINX
    },
    SERVER: {
        // 5xx Server Error responses
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
        HTTP_VERSION_NOT_SUPPORTED: 505,
        VARIANT_ALSO_NEGOTIATES: 506,
        INSUFFICIENT_STORAGE: 507,
        LOOP_DETECTED: 508,
        BANDWIDTH_LIMIT_EXCEEDED: 509, // Apache Web Server
        NOT_EXTENDED: 510,
        NETWORK_AUTHENTICATION_REQUIRED: 511,
        // eslint-disable-next-line id-length
        WEB_SERVER_RETURNED_AN_UNKNOWN_ERROR: 520, // Cloudflare
        WEB_SERVER_IS_DOWN: 521, // Cloudflare
        CONNECTION_TIME_OUT: 522, // Cloudflare
        ORIGIN_IS_UNREACHABLE: 523, // Cloudflare
        A_TIMEOUT_OCCURRED: 524, // Cloudflare
        SSL_HANDSHAKE_FAILED: 525, // Cloudflare
        INVALID_SSL_CERTIFICATE: 526, // Cloudflare
        RAILGUN_ERROR: 527, // Cloudflare
        UNAUTHORIZED: 561, // AWS ELB
    },
};

// ========================== Convert ========================== //

/**
 * @param {string} value
 * @returns {string}
 */
function splitCamelCase(value) {
    return String(value).replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

// ========================== Validation ========================== //

/**
 *
 * @param {*} value
 * @returns
 */
function isNumber(value) {
    return !isNaN(value)
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// ========================== Fetcher ========================== //

const customMethodJson = ({ url, method, data = {}, headers = {} }) => {
    // console.log({ url, method, data, headers }); // debug
    return new Promise((resolve) => {
        const prepare = {}
        prepare.method = String(method).toUpperCase()
        if (isObject(data) && Object.keys(data).length > 0) {
            prepare.body = JSON.stringify(data)
        }
        return fetch(url, {
            headers: {
                'User-Agent': 'okhttp/4.5.0',
                'Content-Type': 'application/json',
                ...headers,
            },
            ...prepare,
        })
            .then(async (res) => { // positive response
                resolve({
                    res,
                    status: res.status,
                    data: await res.json(),
                })
            })
            .catch((error) => {
                console.log({ error });
            })
            .finally(() => {
                resolve(false)
            })
    })
};

// ========================== Highlight ========================== //

/**
 * @param {{}} json
 * @returns
 */
function syntaxHighlight(json) {
    // eslint-disable-next-line no-param-reassign
    json = JSON.stringify(json, null, 2)
    // eslint-disable-next-line no-param-reassign
    json = json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    // eslint-disable-next-line max-len
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// ========================== Create : Data ========================== //

/**
 * @param {string} url
 * @param {{}} query
 * @returns
 */
function createUrlFromGetQuery(url, query) {
    const save = new URL(url)
    // eslint-disable-next-line arrow-body-style
    Object.keys(query).forEach(key => save.searchParams.append(key, query[key]))
    return save.href
}

// ========================== Selector ========================== //
const project_name = document.querySelector('.navbar > header')
const navigation = document.querySelector('.navbar > ul')
const body_item = document.querySelector('#main-doc')

// ========================== Create : Elements ========================== //

const createImg = (src, width = 100) => {
    const img = document.createElement('img')
    img.src = src
    img.style.width = `${width}px`
    img.style.display = 'block'
    img.style.margin = '20px auto'
    return img
}

// eslint-disable-next-line require-jsdoc
function createInput(name, type) {
    const input = document.createElement('input')
    input.dataset.type = type
    input.name = name
    input.required = true
    input.placeholder = name
    input.style.width = '100%'
    input.style.margin = '8px 0'
    input.style.display = 'inline-block'
    input.style.border = '1px solid #ccc'
    input.style.borderRadius = '4px'
    input.style.boxShadow = 'inset 0 1px 3px #ddd'
    input.style.boxSizing = 'border-box'
    input.style.padding = '12px 20px 12px 20px'
    return input
}

const createSpan = (name) => {
    const span = document.createElement('span')
    span.innerHTML = name
    return span
}

const newNavbarItem = (route) => {
    const { file_name } = route
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.className = 'nav-link'
    a.href = `#${file_name}`
    a.onclick = (e) => {
        e.preventDefault()
        const id = String(e.target.hash).replace('#', '')
        document.getElementById(id).scrollIntoView({
            behavior: 'smooth'
        });
    }
    a.innerHTML = splitCamelCase(file_name)
    li.appendChild(a)
    return li
}

const newEndpoint = (id, part, render, availableDescription = false) => {
    // ================================================== //
    const container = document.createElement('div')
    const head_file = document.createElement('button')
    head_file.className = 'collapsible'
    head_file.innerHTML = part
    container.appendChild(head_file) // ok
    const content = document.createElement('div')
    content.className = 'content'
    content.id = id
    if (availableDescription) {
        const paragraph = document.createElement('p')
        paragraph.appendChild(render)
        content.appendChild(paragraph) // ok
    } else {
        content.appendChild(createImg('/doc/helper/blank.webp')) // ok
    }
    container.appendChild(content)
    return container
}

const createItem = ({ title, before, desc = false, pre = false }) => {
    const ul_view = document.createElement('ul')
    const li_view = document.createElement('li')
    const title_response = document.createElement('h5')
    title_response.innerHTML = title
    li_view.appendChild(title_response)
    if (before) {
        li_view.appendChild(before)
    }
    if (desc) {
        li_view.appendChild(desc)
    }
    if (pre) {
        const response = document.createElement('pre')
        response.innerHTML = pre
        li_view.appendChild(response)
    }
    ul_view.appendChild(li_view)
    return ul_view
}

// eslint-disable-next-line require-jsdoc
function createDescription(object_description) {
    const div = document.createElement('div')
    div.style.marginLeft = '30px'
    // eslint-disable-next-line no-shadow
    const title = document.createElement('span')
    title.style.fontSize = '15px'
    title.innerHTML = 'Description :'
    const ul = document.createElement('ul')
    Object.keys(object_description).forEach(key => {
        const li = document.createElement('li')
        li.innerHTML = `${key} : ${object_description[key]}`
        ul.appendChild(li)
    })
    div.appendChild(title)
    div.appendChild(ul)
    return div
}

// eslint-disable-next-line require-jsdoc
function renderGroupInput(form, data, keterangan) {
    form.appendChild(createSpan(keterangan))
    Object.keys(data).forEach(key => {
        // loop input data
        form.appendChild(createInput(key, 'data'))
        form.appendChild(document.createElement('br'))
    })
}

// eslint-disable-next-line require-jsdoc
function autoHightContent(content, add) {
    const content_height = parseInt(document.getElementById(content).style.maxHeight, 10)
    const add_height = parseInt(document.getElementById(add).clientHeight, 10)
    document.getElementById(content).style.maxHeight = `${content_height + add_height}px`
}

// eslint-disable-next-line require-jsdoc
function display(id, show) {
    document.getElementById(id).style.display = show ? '' : 'none'
}
// eslint-disable-next-line require-jsdoc
function innerHTML(id, value = '') {
    document.getElementById(id).innerHTML = value
}

const newBodyItem = (route) => {
    const { file_name, methods } = route

    const section = document.createElement('section')
    section.className = 'main-section'
    section.id = file_name

    const header_file_name = document.createElement('header')
    header_file_name.innerHTML = splitCamelCase(file_name)
    section.appendChild(header_file_name)

    // loop
    methods.forEach(endpoint => {
        const {
            url, method, function_name, documentation
        } = endpoint

        const type_data = []
        // eslint-disable-next-line no-unused-expressions
        documentation?.query ? type_data.push('query') : ''
        // eslint-disable-next-line no-unused-expressions
        documentation?.parameters ? type_data.push('parameters') : ''
        // eslint-disable-next-line no-unused-expressions
        documentation?.body ? type_data.push('body') : ''

        const container = document.createElement('div')

        const desc = document.createElement('p')
        desc.innerHTML = documentation?.description !== undefined ? documentation.description : ''
        container.appendChild(desc)

        if (Object.keys(documentation).length > 0) {
            // console.log({ function_name, documentation });

            // eslint-disable-next-line max-len
            if (documentation?.headers || documentation?.query || documentation?.parameters || documentation?.body) {
                container.appendChild(document.createElement('hr'))
            }

            // list all headers
            if (documentation?.headers) {
                container.appendChild(createItem({
                    title: 'Headers',
                    pre: syntaxHighlight(documentation.headers),
                }))
                // headersDesc
                if (documentation?.headersDesc) {
                    container.appendChild(createDescription(documentation.headersDesc))
                }
            }

            // list all parameters, query, body
            if (documentation?.parameters && (type_data.includes('parameters') || String(url).includes(':'))) {
                container.appendChild(createItem({
                    title: 'Parameters',
                    pre: syntaxHighlight(documentation.parameters),
                }))
                // parametersDesc
                if (documentation?.parametersDesc) {
                    container.appendChild(createDescription(documentation.parametersDesc))
                }
            }
            if (documentation?.query && type_data.includes('query')) {
                container.appendChild(createItem({
                    title: 'Query',
                    pre: syntaxHighlight(documentation.query),
                }))
                // queryDesc
                if (documentation?.queryDesc) {
                    container.appendChild(createDescription(documentation.queryDesc))
                }
            } else if (documentation?.body && type_data.includes('body') && ['post', 'put', 'delete'].includes(String(method).toLowerCase())) {
                container.appendChild(createItem({
                    title: 'Body',
                    pre: syntaxHighlight(documentation.body),
                }))
                // bodyDesc
                if (documentation?.bodyDesc) {
                    container.appendChild(createDescription(documentation.bodyDesc))
                }
            }

            // list all positive and negative response
            const response_view = document.createElement('ul')
            const key_all_response = Object.keys(documentation)
                // eslint-disable-next-line arrow-body-style
                .filter(v => ![
                    'description',
                    //
                    'headers', 'headersDesc',
                    'query', 'queryDesc',
                    'parameters', 'parametersDesc',
                    'body', 'bodyDesc',
                    // eslint-disable-next-line arrow-body-style
                ].some(a => v === a))

            // eslint-disable-next-line max-len
            if (key_all_response.length > 0) {
                container.appendChild(document.createElement('hr'))
            }

            key_all_response.forEach(key => {
                // loop
                const li_response = document.createElement('li')
                const title_response = document.createElement('h5')
                // eslint-disable-next-line no-shadow
                let title = `${key === '200' ? 'Positive ' : 'Negative '} Response (${key})`,
                    status_desc = String(key).startsWith('2') ? StatusCode.SUCCESS :
                        String(key).startsWith('4') ? StatusCode.CLIENT :
                            String(key).startsWith('5') ? StatusCode.SERVER :
                                undefined
                // eslint-disable-next-line arrow-body-style
                status_desc = Object.keys(status_desc).filter(v => status_desc[v] === parseInt(key, 10))
                // eslint-disable-next-line operator-assignment
                title += ` (${status_desc})`
                title_response.innerHTML = title
                const pre_response = document.createElement('pre')
                pre_response.innerHTML = syntaxHighlight(documentation[key])
                li_response.appendChild(title_response)
                li_response.appendChild(pre_response)
                response_view.appendChild(li_response)
            })
            container.appendChild(response_view)

            // Form Testing
            if (type_data.includes('query') || type_data.includes('parameters') || type_data.includes('body')) {
                const id_show_form = file_name + function_name

                // button test
                const div_test = document.createElement('div')
                div_test.style.paddingLeft = '25px'
                div_test.style.paddingRight = '5px'
                const button_test = document.createElement('button')
                button_test.type = 'button'
                button_test.innerHTML = 'TEST!'
                button_test.onclick = (e) => { // show form test
                    e.target.style.display = 'none'
                    display(`form_${id_show_form}`, true)

                    // auto height
                    autoHightContent(`content_${file_name}${function_name}`, `form_${id_show_form}`)
                }
                div_test.appendChild(button_test)

                const div_form = document.createElement('div')
                div_form.id = `form_${id_show_form}`
                div_form.style.display = 'none'
                div_form.style.borderRadius = '5px'
                div_form.style.backgroundColor = '#ebdbdb'
                div_form.style.marginTop = '20px'
                div_form.style.marginLeft = '5px'
                div_form.style.marginRight = '5px'
                div_form.style.padding = '40px'
                div_form.style.boxSizing = 'inherit'

                const form = document.createElement('form')
                form.onsubmit = async (e) => {
                    e.preventDefault()
                    display(`submit_${id_show_form}`, false)
                    display(`result_${id_show_form}`, true)
                    innerHTML(`result_${id_show_form}`) // reset loading
                    document.getElementById(`result_${id_show_form}`).appendChild(createImg('/doc/loading.webp'))
                    const all_input = Object.keys(e.target.elements)
                        // eslint-disable-next-line arrow-body-style
                        .filter(v => !isNumber(v))
                        // eslint-disable-next-line arrow-body-style
                        .map(v => e.target.elements[v])
                        .map(elem => {
                            return {
                                name: elem.name,
                                value: elem.value,
                                type: elem.dataset.type,
                            }
                        })
                        .reduce((simpan, item) => {
                            if (item.type === 'header') {
                                simpan.headers[item.name] = item.value
                            } else if (item.type === 'data') {
                                simpan.data[item.name] = item.value
                            }
                            return simpan
                        }, { headers: {}, data: {} })
                    const { headers, data } = all_input
                    // prepare data
                    let init = {
                        url,
                        method,
                        headers,
                        data: {},
                    }
                    if (type_data.includes('parameters') || String(init.url).includes(':')) {
                        console.log('type parameters');
                        const url_parameters = Object.keys(data).reduce((simpan, key) => { // add parameters
                            return String(simpan).replace(`:${key}`, data[key])
                        }, init.url)
                        init.url = url_parameters
                    }
                    if (type_data.includes('query')) { // query (get)
                        console.log('type query');
                        init.url = createUrlFromGetQuery(init.url, data)
                    } else if (type_data.includes('body') && ['post', 'put', 'delete'].includes(String(method).toLowerCase())) { // body (post, put, delete)
                        console.log('type body');
                        init.data = data
                    }
                    // hitter
                    setTimeout(async () => {
                        const hasil = await customMethodJson(init)
                        if (hasil) {
                            // console.log({ init, hasil });
                            // console.log({ all_input, type_data, data, methods, init, hasil }); // debug
                            innerHTML(`result_${id_show_form}`) // reset

                            const pre_json_response = document.createElement('pre')
                            pre_json_response.innerHTML = syntaxHighlight(hasil.data)
                            const status = document.createElement('span')
                            let status_desc = String(hasil.status).startsWith('2') ? StatusCode.SUCCESS :
                                String(hasil.status).startsWith('4') ? StatusCode.CLIENT :
                                    String(hasil.status).startsWith('5') ? StatusCode.SERVER :
                                        undefined
                            // eslint-disable-next-line arrow-body-style
                            status_desc = Object.keys(status_desc).filter(v => status_desc[v] === parseInt(hasil.status, 10))
                            status.style.marginLeft = '3px'
                            status.innerHTML = `Status : (${hasil.status}) (${status_desc})`
                            document.getElementById(`result_${id_show_form}`).appendChild(status)
                            document.getElementById(`result_${id_show_form}`).appendChild(pre_json_response)

                            display(`submit_${id_show_form}`, true)
                            autoHightContent(`content_${file_name}${function_name}`, `result_${id_show_form}`) // auto height
                        } else {
                            display(`submit_${id_show_form}`, true)
                            autoHightContent(`content_${file_name}${function_name}`, `result_${id_show_form}`) // auto height
                        }
                    }, 1000);
                }

                form.appendChild(createSpan('Headers :'))
                Object.keys(documentation.headers).forEach(key => {
                    // loop input header
                    form.appendChild(createInput(key, 'header'))
                    form.appendChild(document.createElement('br'))
                })

                if (type_data.includes('parameters') || String(url).includes(':')) {
                    renderGroupInput(form, documentation?.parameters, 'Parameters :')
                }

                if (type_data.includes('query')) {
                    renderGroupInput(form, documentation?.query, 'Query :')
                } else if (type_data.includes('body') && ['post', 'put', 'delete'].includes(String(method).toLowerCase())) {
                    renderGroupInput(form, documentation?.body, 'Body :')
                }

                const button_submit = document.createElement('button')
                button_submit.id = `submit_${id_show_form}`
                button_submit.type = 'submit'
                button_submit.style.marginTop = '20px'
                button_submit.innerHTML = 'Submit'
                form.appendChild(button_submit)
                div_form.appendChild(form)

                // render result
                const div_result = document.createElement('div')
                div_result.id = `result_${id_show_form}`
                div_result.style.display = 'none'
                div_result.style.paddingTop = '20px'
                div_form.appendChild(div_result)

                container.appendChild(createItem({
                    title: 'Testing',
                    before: div_test,
                    desc: div_form,
                }))
            } else {
                container.appendChild(createImg('/doc/step-by-step.webp', 200))
            }
        }

        section.appendChild(newEndpoint(`content_${file_name}${function_name}`, `[${String(method).toUpperCase()}] ${function_name} ~> ${url}`, container, Object.keys(documentation).length > 0))
    })

    return section
}

window.onload = async () => {
    const { data } = await customMethodJson({
        url: '/doc/data',
        method: 'get'
    })
    console.log('Start...', { data });

    const { name, routes } = data
    project_name.innerHTML = name
    routes.forEach(route => {
        navigation.appendChild(newNavbarItem(route))
        body_item.appendChild(newBodyItem(route))
    })

    const coll = document.getElementsByClassName('collapsible');
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener('click', (e) => {
            e.target.classList.toggle('active')
            const content = e.target.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = `${content.scrollHeight}px`;
            }
        });
    }

    // TEST ZONE //
}
