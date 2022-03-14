/**
 * Helper.js
 */

// ========================= Fetcher ========================= //
const customMethodJson = ({ url, method, data = false, headers = {} }) => {
    const prepare = {}
    if (data && Object.keys(data).length > 0) {
        prepare.data = JSON.stringify(data)
    }
    return new Promise((resolve, reject) => {
        fetch(url, {
            method,
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
                resolve({
                    error,
                })
            })
    })
};

// ========================= JSON Highlight ========================= //

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
        var cls = 'number';
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

// ========================= Convert ========================= //

/**
 * @param {string} value
 * @returns {string}
 */
function splitCamelCase(value) {
    return String(value).replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

/**
 * @param {string} str
 * @returns
 */
function camelize(str) {
    // eslint-disable-next-line no-param-reassign
    str = String(str).toLowerCase()
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
    }).replace(/\s+/g, '');
}

// ========================= Validation ========================= //

/**
 * Check if string value is JSON
 * @param {string} str
 * @returns
 */
function IsJsonString(str) {
    if (typeof str != 'string') {
        return false;
    }
    try {
        JSON.parse(str);
        // eslint-disable-next-line id-length
    } catch (e) {
        return false;
    }
    return true;
}

/**
 *
 * @param {*} value
 * @returns
 */
function isNumber(value) {
    return !isNaN(value)
}

/**
 * @param {*} e
 * @returns
 */
function getAllInputFromForm(e) {
    return Object.keys(e.target.elements)
        // eslint-disable-next-line arrow-body-style
        .filter(key => !isNumber(key))
        // eslint-disable-next-line arrow-body-style
        .reduce((simpan, key) => {
            return { ...simpan, [key]: e.target.elements[key] }
        }, {})
}

// ====================================================================== //
// ============================== Selector ============================== //
const project_name = document.querySelector('.navbar > header')
const navigation = document.querySelector('.navbar > ul')
const body_item = document.querySelector('#main-doc')

const routes = []

// ======================================================================= //
// ========================= JSON Identification ========================= //

/**
 * @param {{}} obj
 */
function typeOfJsonValue(obj) {
    Object.keys(obj).forEach(key => {
        const value = obj[key]
        obj[key] = typeof obj[key] === 'object' && !Array.isArray(obj[key]) ? obj[key] :
            typeof value === 'object' && !Array.isArray(value) ? 'object' :
                typeof value === 'object' && Array.isArray(value) ? 'array' :
                    typeof value === 'number' ? 'integer' : typeof value === 'bigint' ? 'integer' :
                        typeof value
        if (typeof obj[key] === 'object') {
            typeOfJsonValue(obj[key]);
        }
    });
}

// ======================================================================= //
// ========================== Renderer Function ========================== //

const newNavbarItem = (route) => {
    const id = camelize(route.title)
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.className = 'nav-link'
    a.href = `#${id}`
    a.onclick = (e) => {
        e.preventDefault()
        document.getElementById(id).scrollIntoView({
            behavior: 'smooth',
        });
    }
    a.innerHTML = route.title
    li.appendChild(a)
    return li
}

const newBodyItem = (route) => {
    const camel = camelize(route.title)
    // ================================================== //
    const section = document.createElement('section')
    section.className = 'main-section'
    section.id = camel
    // ================================================== //
    const header = document.createElement('header')
    header.innerHTML = route.title
    // ================================================== //
    section.appendChild(header)
    section.appendChild(route.render())
    return section
}

// ====================================================================== //
// ================================ Main ================================ //

// Type of JSON Value
routes.push({
    title: 'Type of JSON Value', render: () => {
        const id = camelize('Type of JSON Value') // sama'in

        const render = document.createElement('div')
        const form = document.createElement('form')

        // ======================================================= //
        const title_textarea = document.createElement('h3')
        title_textarea.innerHTML = 'INPUT JSON :'
        form.appendChild(title_textarea)

        const textarea_input = document.createElement('textarea')
        textarea_input.name = 'json'
        textarea_input.placeholder = 'input JSON here...'
        textarea_input.style.width = '97%'
        textarea_input.style.height = '200px'
        form.appendChild(textarea_input)
        // ======================================================= //

        // ======================================================= //
        const button_submit = document.createElement('button')
        button_submit.type = 'submit'
        button_submit.innerHTML = 'Submit'
        form.appendChild(button_submit)
        // ======================================================= //

        // ======================================================= //
        const div_result = document.createElement('div')
        div_result.style.display = 'none'
        div_result.id = `result_${id}`
        form.onsubmit = (e) => {
            e.preventDefault()
            document.getElementById(`result_${id}`).style.display = ''
            const value = getAllInputFromForm(e)
            // eslint-disable-next-line new-cap
            if (IsJsonString(value.json.value)) {
                const json = JSON.parse(value.json.value)
                typeOfJsonValue(json)
                document.getElementById(`result_${id}`).innerHTML = '' // reset hasil
                const pre_json_response = document.createElement('pre')
                pre_json_response.innerHTML = syntaxHighlight(json)
                document.getElementById(`result_${id}`).appendChild(pre_json_response)
                const textarea_result = document.createElement('textarea')
                textarea_result.innerHTML = JSON.stringify(json)
                textarea_result.style.marginLeft = '5px'
                textarea_result.style.width = '97.55%'
                textarea_result.style.height = '100px'
                document.getElementById(`result_${id}`).appendChild(textarea_result)
            } else {
                // eslint-disable-next-line no-alert
                alert('is not json...')
            }
        }
        form.appendChild(div_result)
        // ======================================================= //

        render.appendChild(form)
        return render
    }
})

// ====================================================================== //
window.onload = async () => {
    const { data } = await customMethodJson({
        url: '/doc/data',
        method: 'get'
    })
    console.log('Start...');
    project_name.innerHTML = data.name

    // smooth scroll
    const anchors = Object.values(document.querySelectorAll('a'))
        // eslint-disable-next-line arrow-body-style
        .filter(v => String(v.hash).startsWith('#'))
    for (let i = 0, l = anchors.length; i < l; i++) {
        anchors[i].onclick = (e) => {
            e.preventDefault()
            const id = String(e.target.hash).replace('#', '')
            document.getElementById(id).scrollIntoView({
                behavior: 'smooth',
            });
        }
    }

    // render all tester
    routes.forEach(route => {
        navigation.appendChild(newNavbarItem(route))
        body_item.appendChild(newBodyItem(route))
    })

    // TEST ZONE //
}
