import { ActivityIndicator, View } from "react-native";
import { Skeleton } from "@/components/ui";
import { ORANGE } from "../format";

/** Skeleton kept in the module so the screen file stays a container. */
export function PlanSkeleton() {
  return (
    <View className="px-5 pt-4">
      <Skeleton height={76} className="rounded-3xl" />
      <View className="mt-4 gap-3">
        <Skeleton height={150} className="rounded-3xl" />
        <Skeleton height={150} className="rounded-3xl" />
        <Skeleton height={150} className="rounded-3xl" />
      </View>
      <View className="mt-6 items-center">
        <ActivityIndicator color={ORANGE} />
      </View>
    </View>
  );
}
