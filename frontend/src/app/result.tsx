import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { mockBarcodeData, mockImageScanData } from '@/data/mockData';
import type { ImageScanResult, BarcodeScanResult, FlaggedAdditive } from '@/types';
import { resultStore } from '@/services/resultStore';

// Result components
import { ProductHeader } from '@/components/ProductHeader';
import { OverallScoreCard } from '@/components/OverallScoreCard';
import { MetricScoresCard } from '@/components/MetricScoresCard';
import { WarningCard } from '@/components/WarningCard';
import { GreenwashingAlertCard } from '@/components/GreenwashingAlertCard';
import { SmartCampusSwapCard } from '@/components/SmartCampusSwapCard';
import { NovaCard } from '@/components/NovaCard';
import { IngredientsCard } from '@/components/IngredientsCard';
import { HiddenSugarsCard } from '@/components/HiddenSugarsCard';
import { ENumbersCard } from '@/components/ENumbersCard';
import { AdditivesCard } from '@/components/AdditivesCard';
import { ClaimsCard } from '@/components/ClaimsCard';

type AnyResult = ImageScanResult | BarcodeScanResult;

export default function ResultScreen() {
    console.log('result received by result.tsx');
    const router = useRouter();

    const { mock, mode, barcode, imageUri, resultDataStr } = useLocalSearchParams<{
        mock?: string;
        mode?: string;
        barcode?: string;
        imageUri?: string;
        resultDataStr?: string;
    }>();

    // Determine the scan type
    const scanMode = mode ?? mock ?? 'barcode';
    const isImageScan = scanMode === 'image';

    // ── Data resolution ─────────────────────────────────────────────────────────
    // Priority:
    //   1. In-memory resultStore (fresh result from active scan or history item tap)
    //   2. Real backend result passed via resultDataStr (serialized fallback)
    //   3. Explicit mock dev parameter (only if ?mock=... passed)
    const storeResult = resultStore.getLatestResult();
    let data: AnyResult | null = null;

    if (storeResult) {
        data = storeResult;
    } else if (resultDataStr) {
        try {
            data = JSON.parse(resultDataStr) as AnyResult;
        } catch {
            data = null;
        }
    } else if (mock) {
        data = mock === 'image' ? mockImageScanData : mockBarcodeData;
    }

    const handleClose = () => {
        resultStore.clearLatestResult();
        router.navigate('/(tabs)');
    };

    // If no data is available, show clean empty state instead of crashing
    if (!data) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Feather name="x" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Feather name="alert-circle" size={36} color={theme.colors.textLight} />
                    </View>
                    <Text style={styles.emptyTitle}>No Scan Result</Text>
                    <Text style={styles.emptySubtitle}>
                        Unable to find result data for this scan. Please try scanning again.
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleClose}>
                        <Text style={styles.retryText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Field mapping ─────────────────────────────────────────────────────────
    const productName = 'product_name' in data && data.product_name
        ? data.product_name
        : ('product_type' in data && (data as ImageScanResult).product_type ? (data as ImageScanResult).product_type : 'Unknown Product');

    const source = isImageScan
        ? (data.source || 'Scanned from label')
        : ('source' in data && data.source ? (data as BarcodeScanResult).source : 'Barcode API');

    // Ingredients mapping: array for image scans, string for barcode scans
    const ingredientsData = (() => {
        if ('ingredients' in data && Array.isArray((data as ImageScanResult).ingredients) && (data as ImageScanResult).ingredients!.length > 0) {
            return (data as ImageScanResult).ingredients!;
        }
        if ('extracted_ingredients' in data && Array.isArray((data as ImageScanResult).extracted_ingredients) && (data as ImageScanResult).extracted_ingredients!.length > 0) {
            return (data as ImageScanResult).extracted_ingredients!;
        }
        if ('ingredients' in data && typeof (data as BarcodeScanResult).ingredients === 'string' && (data as BarcodeScanResult).ingredients) {
            return (data as BarcodeScanResult).ingredients;
        }
        return null;
    })();

    const hasIngredients = ingredientsData !== null &&
        (Array.isArray(ingredientsData) ? ingredientsData.length > 0 : ingredientsData.trim().length > 0);

    const novaLevel = 'nova_upf_level' in data && (data as BarcodeScanResult).nova_upf_level != null
        ? (data as BarcodeScanResult).nova_upf_level
        : ('estimated_nova_level' in data ? (data as ImageScanResult).estimated_nova_level : undefined);

    const flaggedAdditives = 'flagged_additives' in data
        ? (data as any).flagged_additives as FlaggedAdditive[] | undefined
        : undefined;
    const hasAdditives = flaggedAdditives && flaggedAdditives.length > 0;

    const personalizedWarning = data.personalized_warning && data.personalized_warning.trim().length > 0
        ? data.personalized_warning
        : null;

    const greenwashingAlert = data.greenwashing_alert && data.greenwashing_alert.trim().length > 0
        ? data.greenwashing_alert
        : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                >
                    <Feather name="x" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. PRODUCT NAME & SOURCE */}
                <ProductHeader name={productName ?? 'Unknown Product'} source={source} />

                {/* 2. OVERALL RESULT (Overall Score + Badge + Neutral Verdict) */}
                <OverallScoreCard
                    score={data.overall_score ?? (data as any).health_score ?? 0}
                    badgeColor={data.badge_color}
                />

                {/* 3. PERSONALIZED CONSIDERATION — only rendered when non-empty */}
                {personalizedWarning && (
                    <WarningCard warning={personalizedWarning} />
                )}

                {/* 4. GREENWASHING ALERT — only rendered when non-empty */}
                {greenwashingAlert && (
                    <GreenwashingAlertCard alert={greenwashingAlert} />
                )}

                {/* 5. HEALTH SCORE & ENVIRONMENTAL IMPACT */}
                <MetricScoresCard
                    healthScore={data.health_score}
                    ecoScore={data.eco_impact_score}
                />

                {/* 6. PROCESSING (NOVA) */}
                {novaLevel != null && (
                    <NovaCard level={novaLevel} />
                )}

                {/* 7. FLAGGED ADDITIVES — only rendered if present */}
                {hasAdditives && (
                    <AdditivesCard additives={flaggedAdditives!} />
                )}

                {/* 8. INGREDIENTS */}
                {hasIngredients && (
                    <IngredientsCard ingredients={ingredientsData!} />
                )}

                {/* Smart Campus Swap — optional/legacy if provided */}
                {data.swap_item && data.approx_cost && data.benefit ? (
                    <SmartCampusSwapCard
                        swapItem={data.swap_item}
                        approxCost={data.approx_cost}
                        benefit={data.benefit}
                    />
                ) : null}

                {/* Extra analysis fields for image scans (if present) */}
                {isImageScan && 'hidden_sugars_found' in data && (data as ImageScanResult).hidden_sugars_found?.length ? (
                    <HiddenSugarsCard sugars={(data as ImageScanResult).hidden_sugars_found!} />
                ) : null}

                {isImageScan && 'e_numbers_found' in data && (data as ImageScanResult).e_numbers_found?.length ? (
                    <ENumbersCard eNumbers={(data as ImageScanResult).e_numbers_found!} />
                ) : null}

                {isImageScan && 'greenwashing_claims_detected' in data && (data as ImageScanResult).greenwashing_claims_detected?.length ? (
                    <ClaimsCard claims={(data as ImageScanResult).greenwashing_claims_detected ?? []} />
                ) : null}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: theme.spacing.m,
        paddingTop: theme.spacing.s,
        paddingBottom: theme.spacing.xs,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.subtle,
    },
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: theme.spacing.l,
        paddingBottom: theme.spacing.xxl,
    },
    bottomPadding: {
        height: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    emptyIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.l,
        ...theme.shadows.subtle,
    },
    emptyTitle: {
        ...theme.typography.h2,
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    retryButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.m,
        borderRadius: theme.radii.pill,
    },
    retryText: {
        ...theme.typography.body,
        color: '#FFF',
        fontWeight: '600',
    },
});
