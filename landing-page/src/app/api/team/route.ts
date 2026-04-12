import { NextRequest, NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";

const getTeamMembers = cache(async () => {
  const fetchOptions = {
    next: {
      revalidate: 0,
    },
  };

  const res = await fetch(
    `${process.env.PAYLOAD_URL}/api/team?limit=100`,
    fetchOptions
  );
  const data = await res.json();
  return data.docs;
});

export async function GET(req: NextRequest) {
  try {
    const res = await getTeamMembers();
    const data = await res.json();

    return NextResponse.json({ success: true, data: data.docs });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
