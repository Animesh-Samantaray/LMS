import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app = initializeApp({ projectId: "our-lms-platform" });

async function test() {
  try {
    await getAuth().verifyIdToken("fake-token");
    console.log("Success");
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
