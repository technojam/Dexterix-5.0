import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { firstName, lastName, email, phone, message } = await req.json();

  if (!firstName || !lastName || !email || !phone || !message) {
    return NextResponse.json(
      { success: false, message: "Missing fields!" },
      { status: 400 },
    );
  }

  const formId = "1FAIpQLSeO5I8xg6nLLGYXkSRVAsQObzbqZckq7GAMBnfCaMPqTc9S1Q";

  const formUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

  const formData = new URLSearchParams();

  formData.append("entry.116982226", firstName);
  formData.append("entry.521561000", lastName);
  formData.append("entry.2003122905", email);
  formData.append("entry.107952949", phone);
  formData.append("entry.2027959821", message);

  await fetch(formUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  return NextResponse.json(
    { success: true, message: "Form submitted successfully!" },
    { status: 200 },
  );
}
