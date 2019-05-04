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
    return {};
}

export function dumpNews(news) {
    return {};
}
