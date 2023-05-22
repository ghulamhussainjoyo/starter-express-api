interface Branch {
    name: string;
    branchID: string;
    moderators: Moderator[];
}

interface Moderator {
    moderatorName: string;
    moderatorID: string;
    branch: string;
    users: User[] | null;
}

interface User {
    username: string;
    userID: string;
    branch: string;
}

interface Response {
    success: boolean;
    branch: Branch[];
}

export function parseResponse(responseString: string): Response {
    const response: Response = JSON.parse(responseString, (key, value) => {
        if (key === "moderators" && typeof value === "string") {
            return JSON.parse(value, (k, v) => {
                if (k === "users" && v === "null") {
                    return null;
                }
                return v;
            });
        }
        return value;
    });
    return response;
}
