import bcrypt

password = "anuj"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode())  # ⬅️ Save this string into MongoDB