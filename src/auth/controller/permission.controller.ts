class PermissionFlag {

    getPermissionFlag(value: string) {
        switch (value) {
            case "user":
                return 1;
            case "moderator":
                return 2;
            case "admin":
                return 3;
        }
    }
}

export default new PermissionFlag()