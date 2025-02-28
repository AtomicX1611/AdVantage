let users = [
    {
        username : "dummyUser1",
        email : "abc@gmail.com",
        password : "123"
    }
]

export const findUserByEmail = (email) => {
       return users.find((user) => user.email === email)
}

export const createUser = (user) => {
    users.push(user);
    return user;
};