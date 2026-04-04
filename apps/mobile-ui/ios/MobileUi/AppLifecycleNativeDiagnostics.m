#import "AppLifecycleNativeDiagnostics.h"

#import <UIKit/UIKit.h>

static NSString *const kNativeLifecycleCurrentSessionKey = @"native-lifecycle-session-v1";
static NSString *const kNativeLifecyclePreviousSessionKey = @"native-lifecycle-previous-session-v1";
static NSUInteger const kNativeLifecycleMaxStoredEvents = 60;

@interface AppLifecycleNativeDiagnostics ()

@property (nonatomic, assign) BOOL started;

@end

@implementation AppLifecycleNativeDiagnostics

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

+ (instancetype)shared
{
  static AppLifecycleNativeDiagnostics *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [AppLifecycleNativeDiagnostics new];
  });
  return sharedInstance;
}

- (void)start
{
  @synchronized (self) {
    if (self.started) {
      return;
    }
    self.started = YES;
  }

  NSDictionary *previous = [self readSessionForKey:kNativeLifecycleCurrentSessionKey];
  if (previous != nil) {
    [self writeSession:previous forKey:kNativeLifecyclePreviousSessionKey];
  }

  NSDictionary *nextSession = @{
    @"sessionId": [self buildSessionId],
    @"startedAt": [self nowIsoString],
    @"events": @[
      @{
        @"at": [self nowIsoString],
        @"name": @"native.session.begin",
        @"details": [self defaultEventDetails],
      },
    ],
  };
  [self writeSession:nextSession forKey:kNativeLifecycleCurrentSessionKey];

  [self installExceptionHandler];
  [self registerForNotification:UIApplicationDidBecomeActiveNotification name:@"native.didBecomeActive"];
  [self registerForNotification:UIApplicationWillResignActiveNotification name:@"native.willResignActive"];
  [self registerForNotification:UIApplicationDidEnterBackgroundNotification name:@"native.didEnterBackground"];
  [self registerForNotification:UIApplicationWillEnterForegroundNotification name:@"native.willEnterForeground"];
  [self registerForNotification:UIApplicationWillTerminateNotification name:@"native.willTerminate"];
  [self registerForNotification:UIApplicationDidReceiveMemoryWarningNotification name:@"native.memoryWarning"];
  [self registerForNotification:NSProcessInfoThermalStateDidChangeNotification name:@"native.thermalStateChanged"];
}

- (nullable NSDictionary *)currentSession
{
  return [self readSessionForKey:kNativeLifecycleCurrentSessionKey];
}

- (nullable NSDictionary *)previousSession
{
  return [self readSessionForKey:kNativeLifecyclePreviousSessionKey];
}

RCT_EXPORT_METHOD(getCurrentSession:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve([self currentSession] ?: (id)kCFNull);
}

RCT_EXPORT_METHOD(getPreviousSession:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve([self previousSession] ?: (id)kCFNull);
}

- (void)registerForNotification:(NSNotificationName)notificationName name:(NSString *)eventName
{
  [[NSNotificationCenter defaultCenter] addObserverForName:notificationName
                                                    object:nil
                                                     queue:nil
                                                usingBlock:^(__unused NSNotification *note) {
    [[AppLifecycleNativeDiagnostics shared] recordEventNamed:eventName details:nil];
  }];
}

- (void)installExceptionHandler
{
  NSSetUncaughtExceptionHandler(&HandleNativeLifecycleUncaughtException);
}

static void HandleNativeLifecycleUncaughtException(NSException *exception)
{
  NSDictionary *details = @{
    @"name": exception.name ?: @"unknown",
    @"reason": exception.reason ?: @"unknown",
  };
  [[AppLifecycleNativeDiagnostics shared] recordEventNamed:@"native.uncaughtException" details:details];
}

- (void)recordEventNamed:(NSString *)name details:(nullable NSDictionary *)details
{
  @synchronized (self) {
    NSDictionary *current = [self readSessionForKey:kNativeLifecycleCurrentSessionKey];
    if (current == nil) {
      return;
    }

    NSArray *events = current[@"events"];
    if (![events isKindOfClass:[NSArray class]]) {
      events = @[];
    }

    NSMutableDictionary *event = [@{
      @"at": [self nowIsoString],
      @"name": name,
      @"details": [self mergeEventDetails:details],
    } mutableCopy];

    NSMutableArray *nextEvents = [events mutableCopy];
    [nextEvents addObject:event];
    if (nextEvents.count > kNativeLifecycleMaxStoredEvents) {
      NSRange overflowRange = NSMakeRange(0, nextEvents.count - kNativeLifecycleMaxStoredEvents);
      [nextEvents removeObjectsInRange:overflowRange];
    }

    NSMutableDictionary *next = [current mutableCopy];
    next[@"events"] = nextEvents;
    [self writeSession:next forKey:kNativeLifecycleCurrentSessionKey];
  }
}

- (NSDictionary *)mergeEventDetails:(nullable NSDictionary *)details
{
  NSMutableDictionary *merged = [[self defaultEventDetails] mutableCopy];
  if (details != nil) {
    [merged addEntriesFromDictionary:details];
  }
  return merged;
}

- (NSDictionary *)defaultEventDetails
{
  UIApplicationState state = UIApplication.sharedApplication.applicationState;
  NSProcessInfo *processInfo = [NSProcessInfo processInfo];

  return @{
    @"appState": [self stringForApplicationState:state],
    @"thermalState": [self stringForThermalState:processInfo.thermalState],
    @"lowPowerModeEnabled": @(processInfo.isLowPowerModeEnabled),
    @"protectedDataAvailable": @(UIApplication.sharedApplication.protectedDataAvailable),
  };
}

- (NSString *)stringForApplicationState:(UIApplicationState)state
{
  switch (state) {
    case UIApplicationStateActive:
      return @"active";
    case UIApplicationStateInactive:
      return @"inactive";
    case UIApplicationStateBackground:
      return @"background";
  }
}

- (NSString *)stringForThermalState:(NSProcessInfoThermalState)state
{
  switch (state) {
    case NSProcessInfoThermalStateNominal:
      return @"nominal";
    case NSProcessInfoThermalStateFair:
      return @"fair";
    case NSProcessInfoThermalStateSerious:
      return @"serious";
    case NSProcessInfoThermalStateCritical:
      return @"critical";
  }
}

- (nullable NSDictionary *)readSessionForKey:(NSString *)key
{
  id raw = [[NSUserDefaults standardUserDefaults] objectForKey:key];
  if (![raw isKindOfClass:[NSDictionary class]]) {
    return nil;
  }

  NSDictionary *session = (NSDictionary *)raw;
  if (![session[@"sessionId"] isKindOfClass:[NSString class]] ||
      ![session[@"startedAt"] isKindOfClass:[NSString class]] ||
      ![session[@"events"] isKindOfClass:[NSArray class]]) {
    return nil;
  }

  return session;
}

- (void)writeSession:(NSDictionary *)session forKey:(NSString *)key
{
  [[NSUserDefaults standardUserDefaults] setObject:session forKey:key];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

- (NSString *)buildSessionId
{
  return [[NSUUID UUID] UUIDString];
}

- (NSString *)nowIsoString
{
  static NSDateFormatter *formatter = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    formatter = [NSDateFormatter new];
    formatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
    formatter.timeZone = [NSTimeZone timeZoneWithAbbreviation:@"UTC"];
    formatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
  });

  return [formatter stringFromDate:[NSDate date]];
}

@end
