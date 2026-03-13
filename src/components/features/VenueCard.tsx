import React from "react";
import { Pressable, Text, View } from "react-native";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Building2,
  Map,
  Navigation,
} from "lucide-react-native";
import type { IVenue } from "@app-types/venue.types";
import {
  buildGoogleMapsUrl,
  buildWazeUrl,
  openExternalUrl,
  parsePhone,
  getTelUrl,
} from "@utils/links.utils";

interface Props {
  venue: IVenue;
}

export const VenueCard = React.memo(({ venue }: Props) => {
  const locationParams = {
    address: venue.address,
    cityName: venue.cityName,
    departmentName: venue.departmentName,
    lat: venue.lat,
    lng: venue.lng,
  };
  const mapsUrl = buildGoogleMapsUrl(locationParams);
  const wazeUrl = buildWazeUrl(locationParams);
  const hasLocation = mapsUrl != null;
  const parsedPhone = venue.phone ? parsePhone(venue.phone) : null;
  const telUrl = parsedPhone ? getTelUrl(parsedPhone) : null;

  return (
    <View className="mb-3.5 overflow-hidden rounded-[24px] bg-white p-4 border border-slate-100 shadow-premium dark:bg-slate-900/40 dark:border-white/5 dark:shadow-premium-dark">
      {/* Header */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <Text
            className="text-[13px] font-sans-bold leading-tight text-slate-900 dark:text-white"
            numberOfLines={2}
          >
            {venue.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Building2 size={10} color="#94A3B8" />
            <Text
              className="text-[11px] font-sans-medium text-slate-500 dark:text-slate-400"
              numberOfLines={1}
            >
              {venue.cityName} · {venue.departmentName}
            </Text>
          </View>
        </View>
        <View className="rounded-lg bg-primary/10 px-2.5 py-1 dark:bg-accent/10">
          <Text className="text-[9.5px] font-sans-bold uppercase tracking-[0.5px] text-primary dark:text-accent">
            {venue.subjectName}
          </Text>
        </View>
      </View>

      {/* Address + Map */}
      {venue.address && (
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-start gap-2">
            <MapPin size={14} color="#64748B" className="mt-0.5" />
            <Text
              className="flex-1 text-[12px] font-sans text-slate-600 dark:text-slate-400"
              numberOfLines={2}
            >
              {venue.address}
            </Text>
          </View>
          {hasLocation && (
            <View className="ml-2 flex-row gap-2">
              <Pressable
                onPress={() => mapsUrl && openExternalUrl(mapsUrl)}
                className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 active:scale-[0.95]"
              >
                <Map size={16} color="#3B82F6" />
              </Pressable>
              <Pressable
                onPress={() => wazeUrl && openExternalUrl(wazeUrl)}
                className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 active:scale-[0.95]"
              >
                <Navigation size={16} color="#33CCFF" />
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* Phone (number + interno por separado) */}
      {parsedPhone && (
        <View className="mb-3 flex-row items-center gap-2">
          <Phone size={14} color="#64748B" />
          <View className="flex-1 flex-row flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Text className="text-[12px] font-sans-semi text-slate-700 dark:text-slate-300">
              {parsedPhone.main}
            </Text>
            {parsedPhone.interno && (
              <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
                Int. {parsedPhone.interno}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Actions row */}
      <View className="flex-row flex-wrap gap-2">
        {telUrl && (
          <Pressable
            onPress={() => openExternalUrl(telUrl)}
            className="flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5 active:opacity-70"
          >
            <Phone size={12} color="#10B981" />
            <Text className="text-[11px] font-sans-semi text-slate-700 dark:text-slate-300">
              Llamar
            </Text>
          </Pressable>
        )}
        {venue.email && (
          <Pressable
            onPress={() => openExternalUrl(`mailto:${venue.email!}`)}
            className="flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5 active:opacity-70"
          >
            <Mail size={12} color="#3B82F6" />
            <Text className="text-[11px] font-sans-semi text-slate-700 dark:text-slate-300">
              Email
            </Text>
          </Pressable>
        )}
        {hasLocation && !venue.address && (
          <Pressable
            onPress={() => mapsUrl && openExternalUrl(mapsUrl)}
            className="flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5 active:opacity-70"
          >
            <ExternalLink size={12} color="#64748B" />
            <Text className="text-[11px] font-sans-semi text-slate-700 dark:text-slate-300">
              Ver en mapa
            </Text>
          </Pressable>
        )}
      </View>

      {venue.distanceKm != null && (
        <Text className="mt-2 text-[10px] font-sans text-slate-400">
          A {venue.distanceKm.toFixed(1)} km de tu ubicación
        </Text>
      )}
    </View>
  );
});
