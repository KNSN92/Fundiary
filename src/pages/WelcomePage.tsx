import { useUser } from "@/app/user";
import { getStreak, StreakStatus, streakStatus } from "@/db/user-db";
import { ArkErrors } from "arktype";
import { useState } from "react";

export default function WelcomePage() {
  const user = useUser();
  const [streak, setStreak] = useState<{
    status: StreakStatus;
    count: number;
  } | null>(null);
  if (user) {
    streakStatus(user.id).then((status) => {
      if (typeof status === "string") {
        setStreak({
          status,
          count: streak ? streak.count : 0,
        });
      }
      if (status instanceof ArkErrors) {
        console.error("Failed to fetch streak status:", status);
      }
    });
    getStreak(user.id).then((count) => {
      if (typeof count === "number") {
        setStreak({
          status: streak ? streak.status : "broken",
          count,
        });
      }
      if (count instanceof ArkErrors) {
        console.error("Failed to fetch streak count:", count);
      }
    });
  }

  return (
    <div className="text-base-text size-full flex flex-col items-center justify-center text-4xl text-center">
      <div>ようこそ FunDiaryへ！</div>
      <div className="mt-8">
        {streak && (
          <div className="">
            連続日記投稿
            <br />
            {streak.count}日
          </div>
        )}
      </div>
    </div>
  );
}
