import axios from "axios";

useEffect(() => {
  axios.get("https://deksis-prod.dek.k12.tr/api/auth/session", {
    withCredentials: true // 🔥 cookie gönderir
  })
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.error(err);
  });
}, []);