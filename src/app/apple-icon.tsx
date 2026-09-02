import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 }; export const contentType = "image/png";
export default function AppleIcon() { return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#173b70",borderRadius:40}}><svg width="120" height="120" viewBox="0 0 32 32"><path d="M8 10.5h5v4H8zm0 7h5v4H8zm11-7h5v4h-5zm0 7h5v4h-5zM13 12.5h6M13 19.5h6M16 12.5v7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>, { ...size }); }
