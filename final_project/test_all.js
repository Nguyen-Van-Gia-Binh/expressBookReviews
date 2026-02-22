const axios = require("axios");

const BASE = "http://localhost:5000";

// Giữ session cookie  
const axiosInstance = axios.create({
    baseURL: BASE,
    withCredentials: true,
});

// Lưu cookie từ response
let cookies = "";

async function test() {
    try {
        // Q2: Get all books
        console.log("=== Q2: GET ALL BOOKS ===");
        const q2 = await axios.get(`${BASE}/`);
        console.log(JSON.stringify(q2.data, null, 2));

        // Q3: Get book by ISBN
        console.log("\n=== Q3: GET BOOK BY ISBN (isbn=1) ===");
        const q3 = await axios.get(`${BASE}/isbn/1`);
        console.log(JSON.stringify(q3.data, null, 2));

        // Q4: Get books by author
        console.log("\n=== Q4: GET BOOKS BY AUTHOR ===");
        const q4 = await axios.get(`${BASE}/author/Jane Austen`);
        console.log(JSON.stringify(q4.data, null, 2));

        // Q5: Get books by title
        console.log("\n=== Q5: GET BOOKS BY TITLE ===");
        const q5 = await axios.get(`${BASE}/title/Fairy tales`);
        console.log(JSON.stringify(q5.data, null, 2));

        // Q6: Get book review (initial - empty)
        console.log("\n=== Q6: GET BOOK REVIEW (isbn=1) ===");
        const q6 = await axios.get(`${BASE}/review/1`);
        console.log(JSON.stringify(q6.data, null, 2));

        // Q7: Register
        console.log("\n=== Q7: REGISTER ===");
        const q7 = await axios.post(`${BASE}/register`, {
            username: "testuser",
            password: "test123",
        });
        console.log(q7.data);

        // Q8: Login (save cookie for session)
        console.log("\n=== Q8: LOGIN ===");
        const q8 = await axios.post(
            `${BASE}/customer/login`,
            { username: "testuser", password: "test123" },
            { withCredentials: true }
        );
        // Extract session cookie
        const setCookie = q8.headers["set-cookie"];
        if (setCookie) {
            cookies = setCookie.map((c) => c.split(";")[0]).join("; ");
        }
        console.log("Response:", q8.data);
        console.log("Session cookie saved:", cookies ? "YES" : "NO");

        // Q9: Add review (with session cookie)
        console.log("\n=== Q9: ADD REVIEW (isbn=1) ===");
        const q9 = await axios.put(
            `${BASE}/customer/auth/review/1`,
            { review: "This is a great book! Highly recommended." },
            { headers: { Cookie: cookies } }
        );
        console.log("Response:", q9.data);

        // Show review after adding
        console.log("\n--- Reviews after adding ---");
        const reviewAfter = await axios.get(`${BASE}/review/1`);
        console.log(JSON.stringify(reviewAfter.data, null, 2));

        // Q10: Delete review (with session cookie)
        console.log("\n=== Q10: DELETE REVIEW (isbn=1) ===");
        const q10 = await axios.delete(`${BASE}/customer/auth/review/1`, {
            headers: { Cookie: cookies },
        });
        console.log("Response:", q10.data);

        // Show review after deleting
        console.log("\n--- Reviews after deleting ---");
        const reviewAfterDelete = await axios.get(`${BASE}/review/1`);
        console.log(JSON.stringify(reviewAfterDelete.data, null, 2));

        console.log("\n✅ ALL TESTS PASSED!");
    } catch (err) {
        console.error(
            "❌ ERROR:",
            err.response ? `${err.response.status} - ${err.response.data}` : err.message
        );
    }
}

test();
