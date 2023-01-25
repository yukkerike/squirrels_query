function queryStringToObject(queryString) {
    let result = {}
    queryString.split('&').forEach(item => {
        let [key, value] = item.split('=')
        result[key] = value
    })
    return result
}

function composeLogin(token) {
    const session = queryStringToObject(token)
    let id, netType, key, tag = 3, ref, result = []
    let OAuth = session.OAuth ? 1 : 0
    let socialFrameToken = session.config ? 1 : 0
    if (!socialFrameToken) {
        id = BigInt(session.userId)
        netType = parseInt(session.net_type)
        switch (session.useApiType) {
            case 'sa':
                key = session.authKey
                ref = -1
                break
                case 'ok':
                    key = session.auth_sig
                    ref = 20000
                    break
            case 'vk':
                key = ""
                ref = 0
                break
            case 'mm':
                key = ""
                ref = 10000
        }
    } else {
        switch (session.useApiType) {
            case 'ok':
                id = BigInt(session.logged_user_id)
                netType = 4
                key = session.auth_sig
                tag = 4
                ref = 20000
                break
            case 'vk':
                id = BigInt(session.viewer_id)
                netType = 0
                key = session.auth_key
                tag = 4
                ref = 0
                break
            case 'mm':
                id = BigInt(session.vid)
                netType = 1
                key = session.authentication_key
                ref = 10011
        }
    }
    result = [id, netType, OAuth, key, tag, ref]
    if (!socialFrameToken)
        if (session.useApiType !== 'sa')
            result.push(session.token)
        else if (session.useApiType === 'ok')
            result.push(session.session_key)
    return result
}

module.exports = composeLogin