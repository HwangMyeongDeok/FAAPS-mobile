import { LogIn, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge, Button } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";

export default function SignIn() {
  const signIn = useAuthStore((s) => s.signIn);
  const status = useAuthStore((s) => s.status);
  const loading = status === "authenticating";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (status === "authenticated") {
    return <Redirect href="/(app)" />;
  }

  const onSubmit = async () => {
    const mail = email.trim();
    if (!mail || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError(null);
    try {
      await signIn({ email: mail, password });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed. Please check your credentials.",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-8 justify-between">
        {/* Top — branding */}
        <View className="flex-1 items-center justify-center">
          <View className="h-20 w-20 rounded-2xl bg-primary items-center justify-center mb-6 shadow-lg">
            <Text className="text-3xl font-bold text-white">F</Text>
          </View>
          <Text className="text-3xl font-bold text-foreground text-center">
            FAAPS
          </Text>
          <Text className="text-base text-muted-foreground text-center mt-2">
            FPT AI Academic Planning System
          </Text>
          <Text className="text-sm text-muted-foreground/80 text-center mt-1">
            For FPT University HCMC students
          </Text>

          {/* Feature pills */}
          <View className="flex-row flex-wrap items-center justify-center gap-2 mt-6">
            <Badge variant="secondary">
              <View className="flex-row items-center gap-1">
                <Sparkles size={12} color="hsl(222.2 47.4% 11.2%)" />
                <Text>AI study planning</Text>
              </View>
            </Badge>
            <Badge variant="secondary">1-on-1 advising</Badge>
            <Badge variant="secondary">GPA tracking</Badge>
          </View>
        </View>

        {/* Bottom — sign-in card */}
        <View>
          <View className="rounded-2xl bg-card border border-border p-5">
            <Text className="text-base font-semibold text-foreground mb-2">
              Sign in
            </Text>
            <Text className="text-sm text-muted-foreground leading-5 mb-5">
              Use the FPT account issued to you. Your academic data stays in
              sync with the FAP portal.
            </Text>

            <Text className="text-xs font-semibold text-foreground mb-1.5">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="student@fpt.edu.vn"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
              className="rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground"
            />

            <Text className="text-xs font-semibold text-foreground mb-1.5 mt-4">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
              onSubmitEditing={onSubmit}
              returnKeyType="go"
              className="rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground"
            />

            {error ? (
              <Text className="mt-3 text-xs font-semibold text-red-500">
                {error}
              </Text>
            ) : null}

            <Button
              label="Sign in"
              variant="primary"
              size="lg"
              loading={loading}
              leftIcon={<LogIn size={18} color="#fff" />}
              onPress={onSubmit}
            />
          </View>

          {loading ? (
            <View className="mt-4 items-center">
              <ActivityIndicator color="#F36F21" />
            </View>
          ) : null}

          <Text className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to the FAAPS terms of use.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
