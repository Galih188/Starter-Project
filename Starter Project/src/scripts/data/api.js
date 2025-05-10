import CONFIG from "../config";

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function getStories() {
  const token = localStorage.getItem("token");
  const response = await fetch(ENDPOINTS.STORIES, {
    headers: {
      Authorization: `Bearer ${
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLVZUQ2V6ZkhXdUZNVHdSWWMiLCJpYXQiOjE3NDYzNzA4MTd92UBzaOtrMWObopB -
        nigp8JY44WXfTuDM9eG -
        iArRLR8
      }`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Gagal mengambil cerita.");
  }

  const { listStory } = await response.json();
  return listStory;
}

export const postStory = async ({ name, description, photo, lat, lon }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("lat", lat);
  formData.append("lon", lon);
  formData.append("photo", dataURLtoFile(photo, "photo.jpg"));

  // const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
  //   method: "POST",
  //   headers: {
  //     Authorization:
  //       "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLVZUQ2V6ZkhXdUZNVHdSWWMiLCJpYXQiOjE3NDYzNjkzNzB9.S0x5UyFWlFTb1yLXXGFuWredV1H1h7sAFfBle7MC-Lg",
  //   },
  //   body: formData,
  // });

  const token = localStorage.getItem("token");
  const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
    headers: {
      Authorization: `Bearer ${
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLVZUQ2V6ZkhXdUZNVHdSWWMiLCJpYXQiOjE3NDYzNzA4MTd92UBzaOtrMWObopB -
        nigp8JY44WXfTuDM9eG -
        iArRLR8
      }`,
    },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result;
};

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}
