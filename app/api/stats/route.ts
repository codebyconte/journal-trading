import { NextResponse } from "next/server";
function retired(){return NextResponse.json({error:"API v0 archivée. Utilise /api/workspace ; historique conservé et exportable."},{status:410});}
export { retired as GET, retired as POST, retired as PUT, retired as PATCH, retired as DELETE };
