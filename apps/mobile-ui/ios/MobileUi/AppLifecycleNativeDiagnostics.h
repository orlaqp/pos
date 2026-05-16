#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

NS_ASSUME_NONNULL_BEGIN

@interface AppLifecycleNativeDiagnostics : NSObject <RCTBridgeModule>

+ (instancetype)shared;
- (void)start;
- (nullable NSDictionary *)currentSession;
- (nullable NSDictionary *)previousSession;

@end

NS_ASSUME_NONNULL_END
