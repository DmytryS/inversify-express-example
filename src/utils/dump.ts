export function dumpUser(user) {
    return {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
    };
}

export function dumpAction(action) {
    return {
        _id: action._id.toString(),
        status: action.status,
        type: action.type
    };
}

export function dumpNews(news) {
    return {
        _id: news._id.toString(),
        name: news.name,
        text: news.text
    };
}
