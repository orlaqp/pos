import { StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export const useSalesScreenStyles = () => {
    const sharedStyles = useSharedStyles();
    const tokens = useDesignTokens();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            salesLayout: {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'stretch',
            },
            categoriesCardWrap: {
                overflow: 'hidden',
                flexShrink: 0,
            },
            categoriesCard: {
                flex: 1,
                overflow: 'hidden',
            },
            productsCard: {
                flex: 1,
                minWidth: 0,
                marginRight: tokens.spacing.sm,
            },
            productsHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: tokens.spacing.sm,
            },
            sectionTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 4,
            },
            sectionSubtitle: {
                color: tokens.colors.textSecondary,
                fontSize: 13,
                maxWidth: 360,
            },
            toggleButton: {
                borderRadius: tokens.radii.xl,
                paddingHorizontal: tokens.spacing.sm,
                minHeight: 36,
            },
            toggleTitle: {
                color: tokens.colors.accent,
                fontSize: 13,
                fontWeight: '700',
                marginLeft: 6,
            },
            emptyCatalogWrap: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: tokens.spacing.xl,
                paddingBottom: tokens.spacing.lg,
            },
            emptyTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 24,
                fontWeight: '700',
                marginBottom: tokens.spacing.xs,
            },
            emptySubtitle: {
                color: tokens.colors.textSecondary,
                fontSize: 15,
                lineHeight: 22,
                textAlign: 'center',
                maxWidth: 420,
                marginBottom: tokens.spacing.lg,
            },
            emptyActions: {
                flexDirection: 'row',
                gap: tokens.spacing.sm,
            },
            primaryAction: {
                backgroundColor: tokens.colors.accent,
                borderRadius: tokens.radii.xl,
                paddingHorizontal: tokens.spacing.md,
                minHeight: 46,
            },
            primaryActionTitle: {
                color: '#ffffff',
                fontWeight: '700',
                marginLeft: 8,
            },
            secondaryAction: {
                borderRadius: tokens.radii.xl,
                borderColor: tokens.colors.accent,
                paddingHorizontal: tokens.spacing.md,
                minHeight: 46,
            },
            secondaryActionTitle: {
                color: tokens.colors.accent,
                fontWeight: '700',
                marginLeft: 8,
            },
            cartPanel: {
                width: 330,
                minWidth: 300,
            },
        }),
    };
};

export type SalesScreenStyles = ReturnType<typeof useSalesScreenStyles>;
