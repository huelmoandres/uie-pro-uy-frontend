import { usePathname } from "expo-router";
import { useAuth } from "@context/AuthContext";
import { useSubscription } from "@context/SubscriptionContext";
import { useOnboarding } from "@context/OnboardingContext";
import { setErrorContext } from "@utils/errorTracking";

/** Rutas de auth. Expo Router excluye (auth) del pathname, por eso usamos /login no /(auth)/login */
const AUTH_PATHNAMES = [
  "/login",
  "/login-verify-otp",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export type RedirectTarget =
  | "/(auth)/login"
  | "/onboarding"
  | "/(tabs)"
  | null;

export interface NavigationRedirectsState {
  inAuthGroup: boolean;
  inPaywall: boolean;
  inOnboarding: boolean;
  mustSeePaywall: boolean;
  hasSeenOnboarding: boolean;
  /** true mientras AsyncStorage carga hasSeenOnboarding */
  isOnboardingLoading: boolean;
  showLoadingOverlay: boolean;
  loadingMessage: string | undefined;
  /** Destino único de redirección; null = no redirigir */
  redirectTarget: RedirectTarget;
  /** true si debemos renderizar Redirect (tenemos destino y no estamos ahí) */
  shouldRedirect: boolean;
}

/**
 * Encapsula la lógica de redirección y overlay de carga del layout raíz.
 * Usado por RootLayoutNav para evitar early returns que provocan
 * "Cannot read property 'stale' of undefined" en expo-router.
 */
export function useNavigationRedirects(): NavigationRedirectsState {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const {
    isPro,
    isInTrial,
    isLoading: isSubscriptionLoading,
  } = useSubscription();
  const { hasSeenOnboarding, isLoading: isOnboardingLoading } = useOnboarding();

  // Expo Router excluye grupos como (auth) del pathname → /login no empieza con /(auth).
  // Usamos pathname contra rutas conocidas (login, register, etc.).
  const inAuthGroup =
    pathname != null &&
    AUTH_PATHNAMES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  // Robusto: pathname puede variar en prod (ej. con base path). Incluir "paywall" en la ruta.
  const inPaywall =
    (pathname != null && (pathname === "/paywall" || pathname.includes("/paywall"))) ?? false;
  const inOnboarding =
    (pathname === "/onboarding" || pathname?.startsWith("/onboarding")) ?? false;
  // Freemium soft-lock: no hay redirect global por suscripción.
  // El paywall aparece por acción explícita (premium gate o error API).
  const mustSeePaywall = false;

  // Un solo destino de redirección para evitar loops por Redirects competidores
  const redirectTarget: RedirectTarget = (() => {
    if (!isAuthenticated && !inAuthGroup) return "/(auth)/login";
    if (isAuthenticated && inAuthGroup) {
      if (!isOnboardingLoading && !hasSeenOnboarding && !inOnboarding)
        return "/onboarding";
      return "/(tabs)";
    }
    // No redirigir cuando el usuario con acceso está en paywall: puede haber entrado
    // desde Perfil para ver estado de suscripción. Puede volver atrás o usar "Ir al inicio".
    if (
      isAuthenticated &&
      !isSubscriptionLoading &&
      !mustSeePaywall &&
      !inPaywall &&
      !inOnboarding &&
      !isOnboardingLoading &&
      !hasSeenOnboarding
    )
      return "/onboarding";
    return null;
  })();

  setErrorContext({
    pathname: pathname ?? "",
    isPro,
    isInTrial,
    isAuthenticated,
  });

  // No mostrar overlay en paywall: deja ver la pantalla mientras se verifica suscripción
  // y evita el loop paywall ↔ overlay "Redirigiendo..."
  const showLoadingOverlay =
    (isLoading ||
      pathname == null ||
      (isAuthenticated && isSubscriptionLoading)) &&
    !inPaywall;

  const loadingMessage = getLoadingMessage({
    isLoading,
    pathname,
    isAuthenticated,
    isSubscriptionLoading,
  });

  const alreadyAtTarget =
    (redirectTarget === "/(auth)/login" && inAuthGroup) ||
    (redirectTarget === "/onboarding" && inOnboarding) ||
    (redirectTarget === "/(tabs)" && !inAuthGroup && !inPaywall && !inOnboarding);

  return {
    inAuthGroup,
    inPaywall,
    inOnboarding,
    mustSeePaywall,
    hasSeenOnboarding: hasSeenOnboarding ?? false,
    isOnboardingLoading,
    showLoadingOverlay,
    loadingMessage,
    redirectTarget,
    shouldRedirect: redirectTarget != null && !alreadyAtTarget,
  };
}

function getLoadingMessage({
  isLoading,
  pathname,
  isAuthenticated,
  isSubscriptionLoading,
}: {
  isLoading: boolean;
  pathname: string | null;
  isAuthenticated: boolean;
  isSubscriptionLoading: boolean;
}): string | undefined {
  if (isLoading) return undefined;
  if (pathname == null) return "Cargando...";
  if (isAuthenticated && isSubscriptionLoading) return "Verificando suscripción...";
  return "Redirigiendo...";
}
