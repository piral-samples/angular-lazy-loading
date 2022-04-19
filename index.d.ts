import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as LibreAtom from '@libre/atom';

declare module "sample-piral" {
  /**
   * Defines the API accessible from pilets.
   */
  export interface PiletApi extends EventEmitter, PiletCustomApi, PiletCoreApi {
    /**
     * Gets the metadata of the current pilet.
     */
    meta: PiletMetadata;
  }

  /**
   * The emitter for Piral app shell events.
   */
  export interface EventEmitter {
    /**
     * Attaches a new event listener.
     * @param type The type of the event to listen for.
     * @param callback The callback to trigger.
     */
    on<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
    /**
     * Detaches an existing event listener.
     * @param type The type of the event to listen for.
     * @param callback The callback to trigger.
     */
    off<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
    /**
     * Emits a new event with the given type.
     * @param type The type of the event to emit.
     * @param arg The payload of the event.
     */
    emit<K extends keyof PiralEventMap>(type: K, arg: PiralEventMap[K]): EventEmitter;
  }

  /**
   * Custom Pilet API parts defined outside of piral-core.
   */
  export interface PiletCustomApi extends PiletLocaleApi, PiletDashboardApi, PiletMenuApi, PiletNotificationsApi, PiletModalsApi, PiletFeedsApi, PiletSearchApi, PiralAuthApi {}

  /**
   * Defines the Pilet API from piral-core.
   * This interface will be consumed by pilet developers so that their pilet can interact with the piral instance.
   */
  export interface PiletCoreApi {
    /**
     * Gets a shared data value.
     * @param name The name of the data to retrieve.
     */
    getData<TKey extends string>(name: TKey): SharedData[TKey];
    /**
     * Sets the data using a given name. The name needs to be used exclusively by the current pilet.
     * Using the name occupied by another pilet will result in no change.
     * @param name The name of the data to store.
     * @param value The value of the data to store.
     * @param options The optional configuration for storing this piece of data.
     * @returns True if the data could be set, otherwise false.
     */
    setData<TKey extends string>(name: TKey, value: SharedData[TKey], options?: DataStoreOptions): boolean;
    /**
     * Registers a route for predefined page component.
     * The route needs to be unique and can contain params.
     * Params are following the path-to-regexp notation, e.g., :id for an id parameter.
     * @param route The route to register.
     * @param Component The component to render the page.
     * @param meta The optional metadata to use.
     */
    registerPage(route: string, Component: AnyComponent<PageComponentProps>, meta?: PiralPageMeta): RegistrationDisposer;
    /**
     * Unregisters the page identified by the given route.
     * @param route The route that was previously registered.
     */
    unregisterPage(route: string): void;
    /**
     * Registers an extension component with a predefined extension component.
     * The name must refer to the extension slot.
     * @param name The global name of the extension slot.
     * @param Component The component to be rendered.
     * @param defaults Optionally, sets the default values for the expected data.
     */
    registerExtension<TName>(name: TName extends string ? TName : string, Component: AnyComponent<ExtensionComponentProps<TName>>, defaults?: Partial<ExtensionParams<TName>>): RegistrationDisposer;
    /**
     * Unregisters a global extension component.
     * Only previously registered extension components can be unregistered.
     * @param name The name of the extension slot to unregister from.
     * @param Component The registered extension component to unregister.
     */
    unregisterExtension<TName>(name: TName extends string ? TName : string, Component: AnyComponent<ExtensionComponentProps<TName>>): void;
    /**
     * React component for displaying extensions for a given name.
     * @param props The extension's rendering props.
     * @return The created React element.
     */
    Extension<TName>(props: ExtensionSlotProps<TName>): React.ReactElement | null;
    /**
     * Renders an extension in a plain DOM component.
     * @param element The DOM element or shadow root as a container for rendering the extension.
     * @param props The extension's rendering props.
     * @return The disposer to clear the extension.
     */
    renderHtmlExtension<TName>(element: HTMLElement | ShadowRoot, props: ExtensionSlotProps<TName>): Disposable;
  }

  /**
   * Describes the metadata transported by a pilet.
   */
  export type PiletMetadata = (SinglePiletMetadata | MultiPiletMetadata) & PiletRuntimeMetadata;

  /**
   * Listener for Piral app shell events.
   */
  export interface Listener<T> {
    (arg: T): void;
  }

  /**
   * The map of known Piral app shell events.
   */
  export interface PiralEventMap extends PiralCustomEventMap {
    "unload-pilet": PiralUnloadPiletEvent;
    [custom: string]: any;
    "store-data": PiralStoreDataEvent;
  }

  export interface PiletLocaleApi {
    /**
     * Gets the currently selected language directly.
     */
    getCurrentLanguage(): string;
    /**
     * Gets the currently selected language in a callback that is also invoked when the
     * selected language changes. Returns a disposable to stop the notifications.
     */
    getCurrentLanguage(cb: (currently: string) => void): Disposable;
    /**
     * Translates the given tag (using the optional variables) into a string using the current language.
     * The used template can contain placeholders in form of `{{variableName}}`.
     * @param tag The tag to translate.
     * @param variables The optional variables to fill into the temnplate.
     */
    translate<T = Record<string, string>>(tag: string, variables?: T): string;
    /**
     * Provides translations to the application.
     * The translations will be exclusively used for retrieving translations for the pilet.
     * @param messages The messages to use as translation basis.
     */
    setTranslations(messages: LocalizationMessages): void;
    /**
     * Gets the currently provided translations by the pilet.
     */
    getTranslations(): LocalizationMessages;
  }

  export interface PiletDashboardApi {
    /**
     * Registers a tile with a predefined tile components.
     * The name has to be unique within the current pilet.
     * @param name The name of the tile.
     * @param Component The component to be rendered within the Dashboard.
     * @param preferences The optional preferences to be supplied to the Dashboard for the tile.
     */
    registerTile(name: string, Component: AnyComponent<TileComponentProps>, preferences?: TilePreferences): RegistrationDisposer;
    /**
     * Registers a tile for predefined tile components.
     * @param Component The component to be rendered within the Dashboard.
     * @param preferences The optional preferences to be supplied to the Dashboard for the tile.
     */
    registerTile(Component: AnyComponent<TileComponentProps>, preferences?: TilePreferences): RegistrationDisposer;
    /**
     * Unregisters a tile known by the given name.
     * Only previously registered tiles can be unregistered.
     * @param name The name of the tile to unregister.
     */
    unregisterTile(name: string): void;
  }

  export interface PiletMenuApi {
    /**
     * Registers a menu item for a predefined menu component.
     * The name has to be unique within the current pilet.
     * @param name The name of the menu item.
     * @param Component The component to be rendered within the menu.
     * @param settings The optional configuration for the menu item.
     */
    registerMenu(name: string, Component: AnyComponent<MenuComponentProps>, settings?: MenuSettings): RegistrationDisposer;
    /**
     * Registers a menu item for a predefined menu component.
     * @param Component The component to be rendered within the menu.
     * @param settings The optional configuration for the menu item.
     */
    registerMenu(Component: AnyComponent<MenuComponentProps>, settings?: MenuSettings): RegistrationDisposer;
    /**
     * Unregisters a menu item known by the given name.
     * Only previously registered menu items can be unregistered.
     * @param name The name of the menu item to unregister.
     */
    unregisterMenu(name: string): void;
  }

  export interface PiletNotificationsApi {
    /**
     * Shows a notification in the determined spot using the provided content.
     * @param content The content to display. Normally, a string would be sufficient.
     * @param options The options to consider for showing the notification.
     * @returns A callback to trigger closing the notification.
     */
    showNotification(content: string | React.ReactElement<any, any> | AnyComponent<NotificationComponentProps>, options?: NotificationOptions): Disposable;
  }

  export interface PiletModalsApi {
    /**
     * Shows a modal dialog with the given name.
     * The modal can be optionally programmatically closed using the returned callback.
     * @param name The name of the registered modal.
     * @param options Optional arguments for creating the modal.
     * @returns A callback to trigger closing the modal.
     */
    showModal<T>(name: T extends string ? T : string, options?: ModalOptions<T>): Disposable;
    /**
     * Registers a modal dialog using a React component.
     * The name needs to be unique to be used without the pilet's name.
     * @param name The name of the modal to register.
     * @param Component The component to render the page.
     * @param defaults Optionally, sets the default values for the inserted options.
     * @param layout Optionally, sets the layout options for the dialog wrapper.
     */
    registerModal<T>(name: T extends string ? T : string, Component: AnyComponent<ModalComponentProps<T>>, defaults?: ModalOptions<T>, layout?: ModalLayoutOptions): RegistrationDisposer;
    /**
     * Unregisters a modal by its name.
     * @param name The name that was previously registered.
     */
    unregisterModal<T>(name: T extends string ? T : string): void;
  }

  export interface PiletFeedsApi {
    /**
     * Creates a connector for wrapping components with data relations.
     * @param resolver The resolver for the initial data set.
     */
    createConnector<T>(resolver: FeedResolver<T>): FeedConnector<T>;
    /**
     * Creates a connector for wrapping components with data relations.
     * @param options The options for creating the connector.
     */
    createConnector<TData, TItem, TReducers extends FeedConnectorReducers<TData>>(options: FeedConnectorOptions<TData, TItem, TReducers>): FeedConnector<TData, TReducers>;
  }

  export interface PiletSearchApi {
    /**
     * Registers a search provider to respond to search queries.
     * The name has to be unique within the current pilet.
     * @param name The name of the search provider.
     * @param provider The callback to be used for searching.
     * @param settings The optional settings for the search provider.
     */
    registerSearchProvider(name: string, provider: SearchProvider, settings?: SearchSettings): RegistrationDisposer;
    /**
     * Registers a search provider to respond to search queries.
     * @param provider The callback to be used for searching.
     * @param settings The optional settings for the search provider.
     */
    registerSearchProvider(provider: SearchProvider, settings?: SearchSettings): RegistrationDisposer;
    /**
     * Unregisters a search provider known by the given name.
     * Only previously registered search providers can be unregistered.
     * @param name The name of the search provider to unregister.
     */
    unregisterSearchProvider(name: string): void;
  }

  export interface PiralAuthApi {
    /**
     * Gets the currently authenticated user, if any.
     */
    getUser(): UserInfo | undefined;
  }

  /**
   * Defines the shape of the data store for storing shared data.
   */
  export interface SharedData<TValue = any> {
    [key: string]: TValue;
  }

  /**
   * Defines the options to be used for storing data.
   */
  export type DataStoreOptions = DataStoreTarget | CustomDataStoreOptions;

  /**
   * Possible shapes for a component.
   */
  export type AnyComponent<T> = React.ComponentType<T> | FirstParametersOf<ComponentConverters<T>>;

  /**
   * The props used by a page component.
   */
  export interface PageComponentProps<T = any, S = any> extends RouteBaseProps<T, S> {
    /**
     * The meta data registered with the page.
     */
    meta: PiralPageMeta;
  }

  /**
   * The meta data registered for a page.
   */
  export interface PiralPageMeta extends PiralCustomPageMeta {}

  /**
   * The shape of an implicit unregister function.
   */
  export interface RegistrationDisposer {
    (): void;
  }

  /**
   * The props of an extension component.
   */
  export interface ExtensionComponentProps<T> extends BaseComponentProps {
    /**
     * The provided parameters for showing the extension.
     */
    params: T extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[T] : T extends string ? any : T;
  }

  /**
   * Gives the extension params shape for the given extension slot name.
   */
  export type ExtensionParams<TName> = TName extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[TName] : TName extends string ? any : TName;

  /**
   * The props for defining an extension slot.
   */
  export type ExtensionSlotProps<TName = string> = BaseExtensionSlotProps<TName extends string ? TName : string, ExtensionParams<TName>>;

  /**
   * Can be implemented by functions to be used for disposal purposes.
   */
  export interface Disposable {
    (): void;
  }

  /**
   * The metadata response for a single pilet.
   */
  export type SinglePiletMetadata = PiletMetadataV0 | PiletMetadataV1 | PiletMetadataV2 | PiletMetadataVx;

  /**
   * The metadata response for a multi pilet.
   */
  export type MultiPiletMetadata = PiletMetadataBundle;

  /**
   * Additional metadata that may be added to the runtime information.
   */
  export interface PiletRuntimeMetadata {
    basePath?: string;
  }

  /**
   * Custom events defined outside of piral-core.
   */
  export interface PiralCustomEventMap {
    "select-language": PiralSelectLanguageEvent;
    "change-user": PiralChangeUserEvent;
  }

  /**
   * Gets fired when a pilet gets unloaded.
   */
  export interface PiralUnloadPiletEvent {
    /**
     * The name of the pilet to be unloaded.
     */
    name: string;
  }

  /**
   * Gets fired when a data item gets stored in piral.
   */
  export interface PiralStoreDataEvent<TValue = any> {
    /**
     * The name of the item that was stored.
     */
    name: string;
    /**
     * The storage target of the item.
     */
    target: string;
    /**
     * The value that was stored.
     */
    value: TValue;
    /**
     * The owner of the item.
     */
    owner: string;
    /**
     * The expiration of the item.
     */
    expires: number;
  }

  export interface LocalizationMessages {
    [lang: string]: Translations;
  }

  export type TileComponentProps = BaseComponentProps & BareTileComponentProps;

  export interface TilePreferences extends PiralCustomTilePreferences {
    /**
     * Sets the desired initial number of columns.
     * This may be overridden either by the user (if resizable true), or by the dashboard.
     */
    initialColumns?: number;
    /**
     * Sets the desired initial number of rows.
     * This may be overridden either by the user (if resizable true), or by the dashboard.
     */
    initialRows?: number;
    /**
     * Determines if the tile can be resized by the user.
     * By default the size of the tile is fixed.
     */
    resizable?: boolean;
    /**
     * Declares a set of custom properties to be used with user-specified values.
     */
    customProperties?: Array<string>;
  }

  export interface MenuComponentProps extends BaseComponentProps {}

  export interface MenuSettings extends PiralCustomMenuSettings {
    /**
     * Sets the type of the menu to attach to.
     * @default "general"
     */
    type?: MenuType;
  }

  export type NotificationComponentProps = BaseComponentProps & BareNotificationProps;

  export interface NotificationOptions extends PiralCustomNotificationOptions {
    /**
     * The title of the notification, if any.
     */
    title?: string;
    /**
     * Determines when the notification should automatically close in milliseconds.
     * A value of 0 or undefined forces the user to close the notification.
     */
    autoClose?: number;
    /**
     * The type of the notification used when displaying the message.
     * By default info is used.
     */
    type?: "info" | "success" | "warning" | "error";
  }

  export type ModalOptions<T> = T extends keyof PiralModalsMap ? PiralModalsMap[T] & BaseModalOptions : T extends string ? BaseModalOptions : T;

  export type ModalComponentProps<T> = BaseComponentProps & BareModalComponentProps<ModalOptions<T>>;

  /**
   * The options provided for the dialog layout.
   */
  export interface ModalLayoutOptions {}

  export interface FeedResolver<TData> {
    (): Promise<TData>;
  }

  export type FeedConnector<TData, TReducers = {}> = GetActions<TReducers> & {
    <TProps>(component: React.ComponentType<TProps & FeedConnectorProps<TData>>): React.FC<TProps>;
    /**
     * Invalidates the underlying feed connector.
     * Forces a reload on next use.
     */
    invalidate(): void;
  };

  export interface FeedConnectorOptions<TData, TItem, TReducers extends FeedConnectorReducers<TData> = {}> {
    /**
     * Function to derive the initial set of data.
     * @returns The promise for retrieving the initial data set.
     */
    initialize: FeedResolver<TData>;
    /**
     * Function to be called for connecting to a live data feed.
     * @param callback The function to call when an item updated.
     * @returns A callback for disconnecting from the feed.
     */
    connect?: FeedSubscriber<TItem>;
    /**
     * Function to be called when some data updated.
     * @param data The current set of data.
     * @param item The updated item to include.
     * @returns The promise for retrieving the updated data set or the updated data set.
     */
    update?: FeedReducer<TData, TItem>;
    /**
     * Defines the optional reducers for modifying the data state.
     */
    reducers?: TReducers;
    /**
     * Optional flag to avoid lazy loading and initialize the data directly.
     */
    immediately?: boolean;
  }

  export interface FeedConnectorReducers<TData> {
    [name: string]: (data: TData, ...args: any) => Promise<TData> | TData;
  }

  export interface SearchProvider {
    (options: SearchOptions, api: PiletApi): Promise<SearchResultType | Array<SearchResultType>>;
  }

  export interface SearchSettings {
    /**
     * Only invoke the search provider if its an immediate search.
     */
    onlyImmediate?: boolean;
    /**
     * Callback to be fired when the search is cleared.
     */
    onClear?(): void;
    /**
     * Callback to be fired when an existing search is cancelled.
     */
    onCancel?(): void;
  }

  export interface UserInfo {
    id: string;
    firstName: string;
    lastName: string;
    mail: string;
    language: string;
    permissions: UserPermissions;
    features: UserFeatures;
  }

  /**
   * Defines the potential targets when storing data.
   */
  export type DataStoreTarget = "memory" | "local" | "remote";

  /**
   * Defines the custom options for storing data.
   */
  export interface CustomDataStoreOptions {
    /**
     * The target data store. By default the data is only stored in memory.
     */
    target?: DataStoreTarget;
    /**
     * Optionally determines when the data expires.
     */
    expires?: "never" | Date | number;
  }

  export type FirstParametersOf<T> = {
    [K in keyof T]: T[K] extends (arg: any) => any ? FirstParameter<T[K]> : never;
  }[keyof T];

  /**
   * Mapping of available component converters.
   */
  export interface ComponentConverters<TProps> extends PiralCustomComponentConverters<TProps> {
    /**
     * Converts the HTML component to a framework-independent component.
     * @param component The vanilla JavaScript component to be converted.
     */
    html(component: HtmlComponent<TProps>): ForeignComponent<TProps>;
  }

  /**
   * The props that every registered page component obtains.
   */
  export interface RouteBaseProps<UrlParams = any, UrlState = any> extends ReactRouter.RouteComponentProps<UrlParams, {}, UrlState>, BaseComponentProps {}

  /**
   * Custom meta data to include for pages.
   */
  export interface PiralCustomPageMeta {}

  /**
   * The props that every registered component obtains.
   */
  export interface BaseComponentProps {
    /**
     * The currently used pilet API.
     */
    piral: PiletApi;
  }

  /**
   * The mapping of the existing (known) extension slots.
   */
  export interface PiralExtensionSlotMap extends PiralCustomExtensionSlotMap {}

  /**
   * The basic props for defining an extension slot.
   */
  export interface BaseExtensionSlotProps<TName, TParams> {
    /**
     * The children to transport, if any.
     */
    children?: React.ReactNode;
    /**
     * Defines what should be rendered when no components are available
     * for the specified extension.
     */
    empty?(): React.ReactNode;
    /**
     * Defines how the provided nodes should be rendered.
     * @param nodes The rendered extension nodes.
     */
    render?(nodes: Array<React.ReactNode>): React.ReactElement<any, any> | null;
    /**
     * The custom parameters for the given extension.
     */
    params?: TParams;
    /**
     * The name of the extension to render.
     */
    name: TName;
  }

  /**
   * Metadata for pilets using the v0 schema.
   */
  export type PiletMetadataV0 = PiletMetadataV0Content | PiletMetadataV0Link;

  /**
   * Metadata for pilets using the v1 schema.
   */
  export interface PiletMetadataV1 {
    /**
     * The name of the pilet, i.e., the package id.
     */
    name: string;
    /**
     * The version of the pilet. Should be semantically versioned.
     */
    version: string;
    /**
     * Optionally provides the version of the specification for this pilet.
     */
    spec?: "v1";
    /**
     * The link for retrieving the content of the pilet.
     */
    link: string;
    /**
     * The reference name for the global require.
     */
    requireRef: string;
    /**
     * The computed integrity of the pilet. Will be used to set the
     * integrity value of the script.
     */
    integrity?: string;
    /**
     * Optionally provides some custom metadata for the pilet.
     */
    custom?: any;
    /**
     * Optionally provides some configuration to be used in the pilet.
     */
    config?: Record<string, any>;
    /**
     * Additional shared dependency script files.
     */
    dependencies?: Record<string, string>;
  }

  /**
   * Metadata for pilets using the v2 schema.
   */
  export interface PiletMetadataV2 {
    /**
     * The name of the pilet, i.e., the package id.
     */
    name: string;
    /**
     * The version of the pilet. Should be semantically versioned.
     */
    version: string;
    /**
     * Provides the version of the specification for this pilet.
     */
    spec: "v2";
    /**
     * The reference name for the global require.
     */
    requireRef: string;
    /**
     * The computed integrity of the pilet.
     */
    integrity?: string;
    /**
     * The link for retrieving the content of the pilet.
     */
    link: string;
    /**
     * Optionally provides some custom metadata for the pilet.
     */
    custom?: any;
    /**
     * Optionally provides some configuration to be used in the pilet.
     */
    config?: Record<string, any>;
    /**
     * Additional shared dependency script files.
     */
    dependencies?: Record<string, string>;
  }

  export interface PiletMetadataVx {
    /**
     * The name of the pilet, i.e., the package id.
     */
    name: string;
    /**
     * The version of the pilet. Should be semantically versioned.
     */
    version: string;
    /**
     * Provides an identifier for the custom specification.
     */
    spec: string;
    /**
     * Optionally provides some custom metadata for the pilet.
     */
    custom?: any;
    /**
     * Optionally provides some configuration to be used in the pilet.
     */
    config?: Record<string, any>;
    /**
     * Additional shared dependency script files.
     */
    dependencies?: Record<string, string>;
  }

  /**
   * Metadata for pilets using the bundle schema.
   */
  export interface PiletMetadataBundle {
    /**
     * The name of the bundle pilet, i.e., the package id.
     */
    name?: string;
    /**
     * Optionally provides the version of the specification for this pilet.
     */
    spec?: "v1";
    /**
     * The link for retrieving the bundle content of the pilet.
     */
    link: string;
    /**
     * The reference name for the global bundle-shared require.
     */
    bundle: string;
    /**
     * The computed integrity of the pilet. Will be used to set the
     * integrity value of the script.
     */
    integrity?: string;
    /**
     * Optionally provides some custom metadata for the pilet.
     */
    custom?: any;
    /**
     * Additional shared dependency script files.
     */
    dependencies?: Record<string, string>;
  }

  export interface PiralSelectLanguageEvent {
    /**
     * Gets the previously selected language.
     */
    previousLanguage: string;
    /**
     * Gets the currently selected language.
     */
    currentLanguage: string;
  }

  export interface PiralChangeUserEvent {
    previous: UserInfo;
    current: UserInfo;
  }

  export interface Translations {
    [tag: string]: string;
  }

  export interface BareTileComponentProps {
    /**
     * The currently used number of columns.
     */
    columns: number;
    /**
     * The currently used number of rows.
     */
    rows: number;
  }

  export interface PiralCustomTilePreferences {}

  export interface PiralCustomMenuSettings {}

  export type MenuType = StandardMenuType | keyof PiralCustomMenuTypes;

  export interface BareNotificationProps {
    /**
     * Callback for closing the notification programmatically.
     */
    onClose(): void;
    /**
     * Provides the passed in options for this particular notification.
     */
    options: NotificationOptions;
  }

  export interface PiralCustomNotificationOptions {}

  export interface BaseModalOptions {}

  export interface PiralModalsMap extends PiralCustomModalsMap {}

  export interface BareModalComponentProps<TOpts> {
    /**
     * Callback for closing the modal programmatically.
     */
    onClose(): void;
    /**
     * Provides the passed in options for this particular modal.
     */
    options?: TOpts;
  }

  export type GetActions<TReducers> = {
    [P in keyof TReducers]: (...args: RemainingArgs<TReducers[P]>) => void;
  };

  export interface FeedConnectorProps<TData> {
    /**
     * The current data from the feed.
     */
    data: TData;
  }

  export interface FeedSubscriber<TItem> {
    (callback: (value: TItem) => void): Disposable;
  }

  export interface FeedReducer<TData, TAction> {
    (data: TData, item: TAction): Promise<TData> | TData;
  }

  export interface SearchOptions {
    /**
     * Gets the query for the search. This is currently available input
     * value.
     */
    query: string;
    /**
     * Gets if the search was requested immediately, e.g., via pressing
     * the enter key.
     */
    immediate: boolean;
  }

  export type SearchResultType = string | React.ReactElement<any> | AnyComponent<SearchResultComponentProps>;

  export type UserPermissions = Record<string, any>;

  export type UserFeatures = Record<string, boolean>;

  export type FirstParameter<T extends (arg: any) => any> = T extends (arg: infer P) => any ? P : never;

  /**
   * Custom component converters defined outside of piral-core.
   */
  export interface PiralCustomComponentConverters<TProps> {}

  /**
   * Definition of a vanilla JavaScript component.
   */
  export interface HtmlComponent<TProps> {
    /**
     * Renders a component into the provided element using the given props and context.
     */
    component: ForeignComponent<TProps>;
    /**
     * The type of the HTML component.
     */
    type: "html";
  }

  /**
   * Generic definition of a framework-independent component.
   */
  export interface ForeignComponent<TProps> {
    /**
     * Called when the component is mounted.
     * @param element The container hosting the element.
     * @param props The props to transport.
     * @param ctx The associated context.
     * @param locals The local state of this component instance.
     */
    mount(element: HTMLElement, props: TProps, ctx: ComponentContext, locals: Record<string, any>): void;
    /**
     * Called when the component should be updated.
     * @param element The container hosting the element.
     * @param props The props to transport.
     * @param ctx The associated context.
     * @param locals The local state of this component instance.
     */
    update?(element: HTMLElement, props: TProps, ctx: ComponentContext, locals: Record<string, any>): void;
    /**
     * Called when a component is unmounted.
     * @param element The container that was hosting the element.
     * @param locals The local state of this component instance.
     */
    unmount?(element: HTMLElement, locals: Record<string, any>): void;
  }

  /**
   * Custom extension slots outside of piral-core.
   */
  export interface PiralCustomExtensionSlotMap {}

  /**
   * Metadata for pilets using the v0 schema with a content.
   */
  export interface PiletMetadataV0Content extends PiletMetadataV0Base {
    /**
     * The content of the pilet. If the content is not available
     * the link will be used (unless caching has been activated).
     */
    content: string;
    /**
     * If available indicates that the pilet should not be cached.
     * In case of a string this is interpreted as the expiration time
     * of the cache. In case of an accurate hash this should not be
     * required or set.
     */
    noCache?: boolean | string;
  }

  /**
   * Metadata for pilets using the v0 schema with a link.
   */
  export interface PiletMetadataV0Link extends PiletMetadataV0Base {
    /**
     * The link for retrieving the content of the pilet.
     */
    link: string;
  }

  export type StandardMenuType = "general" | "admin" | "user" | "header" | "footer";

  export interface PiralCustomMenuTypes {}

  export interface PiralCustomModalsMap {}

  export type RemainingArgs<T> = T extends (_: any, ...args: infer U) => any ? U : never;

  export interface SearchResultComponentProps extends BaseComponentProps {}

  /**
   * The context to be transported into the generic components.
   */
  export interface ComponentContext {
    router: ReactRouter.RouteComponentProps;
    state: LibreAtom.Atom<GlobalState>;
    readState: PiralActions["readState"];
  }

  /**
   * Basic metadata for pilets using the v0 schema.
   */
  export interface PiletMetadataV0Base {
    /**
     * The name of the pilet, i.e., the package id.
     */
    name: string;
    /**
     * The version of the pilet. Should be semantically versioned.
     */
    version: string;
    /**
     * Optionally provides the version of the specification for this pilet.
     */
    spec?: "v0";
    /**
     * The computed hash value of the pilet's content. Should be
     * accurate to allow caching.
     */
    hash: string;
    /**
     * Optionally provides some custom metadata for the pilet.
     */
    custom?: any;
    /**
     * Optionally provides some configuration to be used in the pilet.
     */
    config?: Record<string, any>;
    /**
     * Additional shared dependency script files.
     */
    dependencies?: Record<string, string>;
  }

  /**
   * The Piral global app state container.
   */
  export interface GlobalState extends PiralCustomState {
    /**
     * The relevant state for the app itself.
     */
    app: AppState;
    /**
     * The relevant state for rendering errors of the app.
     */
    errorComponents: ErrorComponentsState;
    /**
     * The relevant state for rendering parts of the app.
     */
    components: ComponentsState;
    /**
     * The relevant state for the registered components.
     */
    registry: RegistryState;
    /**
     * Gets the loaded modules.
     */
    modules: Array<PiletMetadata>;
    /**
     * The foreign component portals to render.
     */
    portals: Record<string, Array<React.ReactPortal>>;
    /**
     * The application's shared data.
     */
    data: Dict<SharedDataItem>;
    /**
     * The used (exact) application routes.
     */
    routes: Dict<React.ComponentType<ReactRouter.RouteComponentProps<any>>>;
    /**
     * The current provider.
     */
    provider?: React.ComponentType;
  }

  /**
   * The globally defined actions.
   */
  export interface PiralActions extends PiralCustomActions {
    /**
     * Initializes the application shell.
     * @param loading The current loading state.
     * @param error The application error, if any.
     * @param modules The loaded pilets.
     */
    initialize(loading: boolean, error: Error | undefined, modules: Array<Pilet>): void;
    /**
     * Injects a pilet at runtime - removes the pilet from registry first if available.
     * @param pilet The pilet to be injected.
     */
    injectPilet(pilet: Pilet): void;
    /**
     * Defines a single action for Piral.
     * @param actionName The name of the action to define.
     * @param action The action to include.
     */
    defineAction<T extends keyof PiralActions>(actionName: T, action: PiralAction<PiralActions[T]>): void;
    /**
     * Defines a set of actions for Piral.
     * @param actions The actions to define.
     */
    defineActions(actions: PiralDefineActions): void;
    /**
     * Reads the value of a shared data item.
     * @param name The name of the shared item.
     */
    readDataValue(name: string): any;
    /**
     * Tries to write a shared data item. The write access is only
     * possible if the name belongs to the provided owner or has not
     * been taken yet.
     * Setting the value to null will release it.
     * @param name The name of the shared data item.
     * @param value The value of the shared data item.
     * @param owner The owner of the shared data item.
     * @param target The target storage locatation.
     * @param expiration The time for when to dispose the shared item.
     */
    tryWriteDataItem(name: string, value: any, owner: string, target: DataStoreTarget, expiration: number): boolean;
    /**
     * Performs a layout change.
     * @param current The layout to take.
     */
    changeLayout(current: LayoutType): void;
    /**
     * Registers a new route to be resolved.
     * @param route The route to register.
     * @param value The page to be rendered on the route.
     */
    registerPage(route: string, value: PageRegistration): void;
    /**
     * Unregisters an existing route.
     * @param route The route to be removed.
     */
    unregisterPage(route: string): void;
    /**
     * Registers a new extension.
     * @param name The name of the extension category.
     * @param value The extension registration.
     */
    registerExtension(name: string, value: ExtensionRegistration): void;
    /**
     * Unregisters an existing extension.
     * @param name The name of the extension category.
     * @param value The extension that will be removed.
     */
    unregisterExtension(name: string, reference: any): void;
    /**
     * Sets the common component to render.
     * @param name The name of the component.
     * @param component The component to use for rendering.
     */
    setComponent<TKey extends keyof ComponentsState>(name: TKey, component: ComponentsState[TKey]): void;
    /**
     * Sets the error component to render.
     * @param type The type of the error.
     * @param component The component to use for rendering.
     */
    setErrorComponent<TKey extends keyof ErrorComponentsState>(type: TKey, component: ErrorComponentsState[TKey]): void;
    /**
     * Sets the common routes to render.
     * @param path The name of the component.
     * @param component The component to use for rendering.
     */
    setRoute<T = {}>(path: string, component: React.ComponentType<ReactRouter.RouteComponentProps<T>>): void;
    /**
     * Includes a new provider as a sub-provider to the current provider.
     * @param provider The provider to include.
     */
    includeProvider(provider: JSX.Element): void;
    /**
     * Destroys (i.e., resets) the given portal instance.
     * @param id The id of the portal to destroy.
     */
    destroyPortal(id: string): void;
    /**
     * Includes the provided portal in the rendering pipeline.
     * @param id The id of the portal to use.
     * @param entry The child to render.
     */
    showPortal(id: string, entry: React.ReactPortal): void;
    /**
     * Hides the provided portal in the rendering pipeline.
     * @param id The id of the portal to use.
     * @param entry The child to remove.
     */
    hidePortal(id: string, entry: React.ReactPortal): void;
    /**
     * Updates the provided portal in the rendering pipeline.
     * @param id The id of the portal to use.
     * @param current The currently displayed child.
     * @param next The updated child that should be displayed.
     */
    updatePortal(id: string, current: React.ReactPortal, next: React.ReactPortal): void;
    /**
     * Dispatches a state change.
     * @param update The update function creating a new state.
     */
    dispatch(update: (state: GlobalState) => GlobalState): void;
    /**
     * Reads the selected part of the global state.
     * @param select The selector for getting the desired part.
     * @returns The desired part.
     */
    readState<S>(select: (state: GlobalState) => S): S;
  }

  /**
   * Custom state extensions defined outside of piral-core.
   */
  export interface PiralCustomState {
    /**
     * Information for the language display.
     */
    language: {
      /**
       * Gets if languages are currently loading.
       */
      loading: boolean;
      /**
       * The selected, i.e., active, language.
       */
      selected: string;
      /**
       * The available languages.
       */
      available: Array<string>;
    };
    /**
     * The currently open notifications.
     */
    notifications: Array<OpenNotification>;
    /**
     * The currently open modal dialogs.
     */
    modals: Array<OpenModalDialog>;
    /**
     * The relevant state for the registered feeds.
     */
    feeds: FeedsState;
    /**
     * The relevant state for the in-site search.
     */
    search: SearchState;
    /**
     * The currently authenticated user, if any.
     */
    user: UserInfo | undefined;
  }

  /**
   * The Piral global app sub-state container for app information.
   */
  export interface AppState {
    /**
     * Information for the layout computation.
     */
    layout: LayoutType;
    /**
     * Gets if the application is currently performing a background loading
     * activity, e.g., for loading modules asynchronously or fetching
     * translations.
     */
    loading: boolean;
    /**
     * Gets an unrecoverable application error, if any.
     */
    error: Error | undefined;
    /**
     * Gets the public path of the application.
     */
    publicPath: string;
  }

  export type ErrorComponentsState = {
    [P in keyof Errors]?: React.ComponentType<Errors[P]>;
  };

  /**
   * The Piral global app sub-state container for shared components.
   */
  export interface ComponentsState extends PiralCustomComponentsState {
    /**
     * The loading indicator renderer.
     */
    LoadingIndicator: React.ComponentType<LoadingIndicatorProps>;
    /**
     * The error renderer.
     */
    ErrorInfo: React.ComponentType<ErrorInfoProps>;
    /**
     * The router context.
     */
    Router: React.ComponentType<RouterProps>;
    /**
     * The layout used for pages.
     */
    Layout: React.ComponentType<LayoutProps>;
    /**
     * The route switch used for determining the route registration.
     */
    RouteSwitch: React.ComponentType<RouteSwitchProps>;
    /**
     * A component that can be used for debugging purposes.
     */
    Debug?: React.ComponentType;
  }

  /**
   * The Piral global app sub-state container for component registrations.
   */
  export interface RegistryState extends PiralCustomRegistryState {
    /**
     * The registered page components for the router.
     */
    pages: Dict<PageRegistration>;
    /**
     * The registered extension components for extension slots.
     */
    extensions: Dict<Array<ExtensionRegistration>>;
    /**
     * The registered wrappers for any component.
     */
    wrappers: Dict<React.ComponentType<any>>;
  }

  export type Dict<T> = Record<string, T>;

  /**
   * Defines the shape of a shared data item.
   */
  export interface SharedDataItem<TValue = any> {
    /**
     * Gets the associated value.
     */
    value: TValue;
    /**
     * Gets the owner of the item.
     */
    owner: string;
    /**
     * Gets the storage location.
     */
    target: DataStoreTarget;
    /**
     * Gets the expiration of the item.
     */
    expires: number;
  }

  /**
   * Custom actions defined outside of piral-core.
   */
  export interface PiralCustomActions {
    /**
     * Changes the selected language.
     * @param selected The selected language.
     */
    selectLanguage(selected: string): void;
    /**
     * Gets the translation for the given key at the current
     * language.
     */
    translate(tag: string, variables?: Record<string, string>): string;
    /**
     * Sets the translations (both global and local) for
     * the given language.
     * @param language The language to set the translations for.
     * @param data The global and local translations.
     */
    setTranslations(language: string, data: LanguageData): void;
    /**
     * Gets the translations (both global and local) for
     * the given language.
     * @param language The language to get the translations for.
     * @result The global and local translations.
     */
    getTranslations(language: string): LanguageData;
    /**
     * Registers a new tile.
     * @param name The name of the tile.
     * @param value The tile registration.
     */
    registerTile(name: string, value: TileRegistration): void;
    /**
     * Unregisters an existing tile.
     * @param name The name of the tile to be removed.
     */
    unregisterTile(name: string): void;
    /**
     * Registers a new menu item.
     * @param name The name of the menu item.
     * @param value The menu registration.
     */
    registerMenuItem(name: string, value: MenuItemRegistration): void;
    /**
     * Unregisters an existing menu item.
     * @param name The name of the menu item to be removed.
     */
    unregisterMenuItem(name: string): void;
    /**
     * Opens the given notification.
     * @param notification The notification to show.
     */
    openNotification(notification: OpenNotification): void;
    /**
     * Closes the given notification.
     * @param notification The notification to hide.
     */
    closeNotification(notification: OpenNotification): void;
    /**
     * Opens the provided dialog.
     * @param dialog The dialog to show.
     */
    openModal(dialog: OpenModalDialog): void;
    /**
     * Closes the provided dialog.
     * @param dialog The dialog to hide.
     */
    closeModal(dialog: OpenModalDialog): void;
    /**
     * Registers a new modal dialog.
     * @param name The name of the modal.
     * @param value The modal registration.
     */
    registerModal(name: string, value: ModalRegistration): void;
    /**
     * Unregisters an existing modal dialog.
     * @param name The name of the modal to be removed.
     */
    unregisterModal(name: string): void;
    /**
     * Creates a new (empty) feed.
     * @param id The id of the feed.
     */
    createFeed(id: string): void;
    /**
     * Destroys an existing feed.
     * @param id The id of the feed.
     */
    destroyFeed(id: string): void;
    /**
     * Loads the feed via the provided details.
     * @param feed The feed details to use for loading.
     */
    loadFeed<TData, TItem>(feed: ConnectorDetails<TData, TItem>): void;
    /**
     * Updates an existing feed.
     * @param id The id of the feed.
     * @param item The item to pass on to the reducer.
     * @param reducer The reducer to use.
     */
    updateFeed<TData, TItem>(id: string, item: TItem, reducer: FeedReducer<TData, TItem>): void;
    /**
     * Registers a new search provider.
     * @param name The name of the search provider.
     * @param value The value representing the provider.
     */
    registerSearchProvider(name: string, value: SearchProviderRegistration): void;
    /**
     * Unregisters an existing search provider.
     * @param name The name of the search provider.
     */
    unregisterSearchProvider(name: string): void;
    /**
     * Sets the current search input.
     * @param input The input to set.
     */
    setSearchInput(input: string): void;
    /**
     * Resets the search results.
     * @param input The input to set.
     * @param loading Determines if further results are currently loading.
     */
    resetSearchResults(input: string, loading: boolean): void;
    /**
     * Appends more results to the existing results.
     * @param items The items to append.
     * @param done Determines if more results are pending.
     */
    appendSearchResults(items: Array<React.ReactChild>, done: boolean): void;
    /**
     * Prepends more results to the existing results.
     * @param items The items to prepend.
     * @param done Determines if more results are pending.
     */
    prependSearchResults(items: Array<React.ReactChild>, done: boolean): void;
    /**
     * Triggers the search explicitly.
     * @param input Optionally sets the query to look for. Otherwise the current input is taken.
     * @param immediate Optionally, determins if the search was invoked immediately.
     */
    triggerSearch(input?: string, immediate?: boolean): Disposable;
    /**
     * Sets the currently logged in user.
     * @param user The current user or undefined is anonymous.
     * @param features The features for the current user, if any.
     * @param permissions The permissions of the current user, if any.
     */
    setUser(user: UserInfo, features: UserFeatures, permissions: UserPermissions): void;
  }

  /**
   * An evaluated pilet, i.e., a full pilet: functionality and metadata.
   */
  export type Pilet = SinglePilet | MultiPilet;

  /**
   * The shape of an app action in Piral.
   */
  export interface PiralAction<T extends (...args: any) => any> {
    (ctx: GlobalStateContext, ...args: Parameters<T>): ReturnType<T>;
  }

  /**
   * A subset of the available app actions in Piral.
   */
  export type PiralDefineActions = Partial<{
    [P in keyof PiralActions]: PiralAction<PiralActions[P]>;
  }>;

  /**
   * The different known layout types.
   */
  export type LayoutType = "mobile" | "tablet" | "desktop";

  /**
   * The interface modeling the registration of a pilet page component.
   */
  export interface PageRegistration extends BaseRegistration {
    component: WrappedComponent<PageComponentProps>;
    meta: PiralPageMeta;
  }

  /**
   * The interface modeling the registration of a pilet extension component.
   */
  export interface ExtensionRegistration extends BaseRegistration {
    component: WrappedComponent<ExtensionComponentProps<string>>;
    reference: any;
    defaults: any;
  }

  export interface OpenNotification {
    id: string;
    component: React.ComponentType<BareNotificationProps>;
    options: NotificationOptions;
    close(): void;
  }

  export interface OpenModalDialog {
    /**
     * Gets the ID of the modal to open. For tracking its state.
     */
    id: string;
    /**
     * Specifies the fully qualified name of the dialog to show.
     */
    name: string;
    /**
     * Specifies the alternative (original) name of the dialog to show.
     */
    alternative?: string;
    /**
     * Defines the transported options.
     */
    options: BaseModalOptions;
    /**
     * Closes the modal dialog.
     */
    close(): void;
  }

  export interface FeedsState {
    [id: string]: FeedDataState;
  }

  export interface SearchState {
    /**
     * Gets the current input value.
     */
    input: string;
    /**
     * Gets the current result state.
     */
    results: {
      /**
       * Gets weather the search is still loading.
       */
      loading: boolean;
      /**
       * The results to display for the current search.
       */
      items: Array<React.ReactChild>;
    };
  }

  /**
   * Map of all error types to their respective props.
   */
  export interface Errors extends PiralCustomErrors {
    /**
     * The props type for an extension error.
     */
    extension: ExtensionErrorInfoProps;
    /**
     * The props type for a loading error.
     */
    loading: LoadingErrorInfoProps;
    /**
     * The props type for a page error.
     */
    page: PageErrorInfoProps;
    /**
     * The props type for a not found error.
     */
    not_found: NotFoundErrorInfoProps;
    /**
     * The props type for an unknown error.
     */
    unknown: UnknownErrorInfoProps;
  }

  /**
   * Custom parts of the global custom component state defined outside of piral-core.
   */
  export interface PiralCustomComponentsState {
    /**
     * Represents the component for rendering a language selection.
     */
    LanguagesPicker: React.ComponentType<LanguagesPickerProps>;
    /**
     * The dashboard container component.
     */
    DashboardContainer: React.ComponentType<DashboardContainerProps>;
    /**
     * The dashboard tile component.
     */
    DashboardTile: React.ComponentType<DashboardTileProps>;
    /**
     * The menu container component.
     */
    MenuContainer: React.ComponentType<MenuContainerProps>;
    /**
     * The menu item component.
     */
    MenuItem: React.ComponentType<MenuItemProps>;
    /**
     * The host component for notifications.
     */
    NotificationsHost: React.ComponentType<NotificationsHostProps>;
    /**
     * The notification toast component.
     */
    NotificationsToast: React.ComponentType<NotificationsToastProps>;
    /**
     * The host component for modal dialogs.
     */
    ModalsHost: React.ComponentType<ModalsHostProps>;
    /**
     * The modal dialog component.
     */
    ModalsDialog: React.ComponentType<ModalsDialogProps>;
    /**
     * The component for showing the results of the search.
     */
    SearchResult: React.ComponentType<SearchResultProps>;
    /**
     * The container for showing search.
     */
    SearchContainer: React.ComponentType<SearchContainerProps>;
    /**
     * The input component for search capability.
     */
    SearchInput: React.ComponentType<SearchInputProps>;
  }

  /**
   * The props of a Loading indicator component.
   */
  export interface LoadingIndicatorProps {}

  /**
   * The props for the ErrorInfo component.
   */
  export type ErrorInfoProps = UnionOf<Errors>;

  /**
   * The props of a Router component.
   */
  export interface RouterProps {}

  /**
   * The props of a Layout component.
   */
  export interface LayoutProps {
    /**
     * The currently selected layout type.
     */
    currentLayout: LayoutType;
  }

  /**
   * The props of the RouteSwitch component.
   */
  export interface RouteSwitchProps extends ReactRouter.SwitchProps {
    /**
     * The component that should be used in case nothing was found.
     */
    NotFound: React.ComponentType<ReactRouter.RouteComponentProps>;
    /**
     * The component to register for the different paths.
     */
    paths: Array<{
      /**
       * The exact path to use.
       */
      path: string;
      /**
       * The component to register for this path.
       */
      Component: React.ComponentType<ReactRouter.RouteComponentProps>;
    }>;
  }

  /**
   * Custom parts of the global registry state defined outside of piral-core.
   */
  export interface PiralCustomRegistryState {
    /**
     * The registered tile components for a dashboard.
     */
    tiles: Dict<TileRegistration>;
    /**
     * The registered menu items for global display.
     */
    menuItems: Dict<MenuItemRegistration>;
    /**
     * The registered modal dialog components.
     */
    modals: Dict<ModalRegistration>;
    /**
     * The registered search providers for context aware search.
     */
    searchProviders: Dict<SearchProviderRegistration>;
  }

  export interface LanguageData {
    global: Translations;
    locals: Array<{
      name: string;
      value: Translations;
    }>;
  }

  export interface TileRegistration extends BaseRegistration {
    component: WrappedComponent<TileComponentProps>;
    preferences: TilePreferences;
  }

  export interface MenuItemRegistration extends BaseRegistration {
    component: WrappedComponent<MenuComponentProps>;
    settings: MenuSettings;
  }

  export interface ModalRegistration extends BaseRegistration {
    name: string;
    component: WrappedComponent<ModalComponentProps<any>>;
    defaults: any;
    layout: ModalLayoutOptions;
  }

  export interface ConnectorDetails<TData, TItem, TReducers extends FeedConnectorReducers<TData> = {}> extends FeedConnectorOptions<TData, TItem, TReducers> {
    /**
     * The ID of the connector.
     */
    id: string;
    /**
     * The dispose function if active.
     */
    dispose?(): void;
  }

  export interface SearchProviderRegistration extends BaseRegistration {
    search: SearchHandler;
    cancel(): void;
    clear(): void;
    onlyImmediate: boolean;
  }

  /**
   * An evaluated single pilet.
   */
  export type SinglePilet = SinglePiletApp & SinglePiletMetadata;

  /**
   * An evaluated multi pilet.
   */
  export type MultiPilet = MultiPiletApp & MultiPiletMetadata;

  /**
   * The Piral app instance context.
   */
  export interface GlobalStateContext extends PiralActions, EventEmitter {
    /**
     * The global state context atom.
     * Changes to the state should always be dispatched via the `dispatch` action.
     */
    state: LibreAtom.Atom<GlobalState>;
    /**
     * The API objects created for the loaded pilets.
     */
    apis: PiletsBag;
    /**
     * The available component converters.
     */
    converters: ComponentConverters<any>;
    /**
     * The initial options.
     */
    options: LoadPiletsOptions;
  }

  /**
   * The base type for pilet component registration in the global state context.
   */
  export interface BaseRegistration {
    pilet: string;
  }

  export type WrappedComponent<TProps> = React.ComponentType<Without<TProps, keyof BaseComponentProps>>;

  export interface FeedDataState {
    /**
     * Determines if the feed data is currently loading.
     */
    loading: boolean;
    /**
     * Indicates if the feed data was already loaded and is active.
     */
    loaded: boolean;
    /**
     * Stores the potential error when initializing or loading the feed.
     */
    error: any;
    /**
     * The currently stored feed data.
     */
    data: any;
  }

  /**
   * Custom errors defined outside of piral-core.
   */
  export interface PiralCustomErrors {
    tile: TileErrorInfoProps;
    menu: MenuItemErrorInfoProps;
    modal: ModalErrorInfoProps;
    feed: FeedErrorInfoProps;
  }

  /**
   * The error used when a registered extension component crashed.
   */
  export interface ExtensionErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "extension";
    /**
     * The provided error details.
     */
    error: any;
    /**
     * The name of the pilet emitting the error.
     */
    pilet?: string;
  }

  /**
   * The error used when the app could not be loaded.
   */
  export interface LoadingErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "loading";
    /**
     * The provided error details.
     */
    error: any;
  }

  /**
   * The error used when a registered page component crashes.
   */
  export interface PageErrorInfoProps extends ReactRouter.RouteComponentProps {
    /**
     * The type of the error.
     */
    type: "page";
    /**
     * The provided error details.
     */
    error: any;
    /**
     * The name of the pilet emitting the error.
     */
    pilet?: string;
  }

  /**
   * The error used when a route cannot be resolved.
   */
  export interface NotFoundErrorInfoProps extends ReactRouter.RouteComponentProps {
    /**
     * The type of the error.
     */
    type: "not_found";
  }

  /**
   * The error used when the exact type is unknown.
   */
  export interface UnknownErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "unknown";
    /**
     * The provided error details.
     */
    error: any;
    /**
     * The name of the pilet emitting the error.
     */
    pilet?: string;
  }

  export interface LanguagesPickerProps {
    /**
     * The currently selected language.
     */
    selected: string;
    /**
     * The languages available for selection.
     */
    available: Array<string>;
  }

  export interface DashboardContainerProps extends ReactRouter.RouteComponentProps {}

  export interface DashboardTileProps {
    /**
     * The currently used number of columns.
     */
    columns: number;
    /**
     * The currently used number of rows.
     */
    rows: number;
    /**
     * The resizable status.
     */
    resizable: boolean;
    /**
     * The provided tile preferences.
     */
    meta: TilePreferences;
  }

  export interface MenuContainerProps {
    /**
     * The type of the menu.
     */
    type: MenuType;
  }

  export interface MenuItemProps {
    /**
     * The type of the menu.
     */
    type: MenuType;
    /**
     * The provided menu settings.
     */
    meta: MenuSettings;
  }

  export interface NotificationsHostProps {}

  export interface NotificationsToastProps extends BareNotificationProps {}

  export interface ModalsHostProps {
    /**
     * Gets if the modal is currently open or closed.
     */
    open: boolean;
    /**
     * Callback to invoke closing the modal dialog.
     */
    close(): void;
  }

  export interface ModalsDialogProps extends OpenModalDialog {
    layout: ModalLayoutOptions;
    defaults: any;
  }

  export interface SearchResultProps {}

  export interface SearchContainerProps {
    /**
     * Gets if the results are still gathered.
     */
    loading: boolean;
  }

  export interface SearchInputProps {
    setValue(value: string): void;
    value: string;
  }

  export type UnionOf<T> = {
    [K in keyof T]: T[K];
  }[keyof T];

  export interface SearchHandler {
    (options: SearchOptions): Promise<Array<React.ReactChild>>;
  }

  /**
   * The pilet app, i.e., the functional exports.
   */
  export interface SinglePiletApp {
    /**
     * Integrates the evaluated pilet into the application.
     * @param api The API to access the application.
     */
    setup(api: PiletApi): void | Promise<void>;
    /**
     * Optional function for cleanup.
     * @param api The API to access the application.
     */
    teardown?(api: PiletApi): void;
  }

  /**
   * The pilet app, i.e., the functional exports.
   */
  export interface MultiPiletApp {
    /**
     * Integrates the evaluated pilet into the application.
     * @param api The API to access the application.
     */
    setup(apiFactory: PiletApiCreator): void | Promise<void>;
  }

  /**
   * Represents the dictionary of the loaded pilets and their APIs.
   */
  export interface PiletsBag {
    [name: string]: PiletApi;
  }

  /**
   * The options for loading pilets.
   */
  export interface LoadPiletsOptions {
    /**
     * The callback function for creating an API object.
     * The API object is passed on to a specific pilet.
     */
    createApi: PiletApiCreator;
    /**
     * The callback for fetching the dynamic pilets.
     */
    fetchPilets: PiletRequester;
    /**
     * Optionally, some already existing evaluated pilets, e.g.,
     * helpful when debugging or in SSR scenarios.
     */
    pilets?: Array<Pilet>;
    /**
     * Optionally, configures the default loader.
     */
    config?: DefaultLoaderConfig;
    /**
     * Optionally, defines the default way how to load a pilet.
     */
    loadPilet?: PiletLoader;
    /**
     * Optionally, defines loaders for custom specifications.
     */
    loaders?: CustomSpecLoaders;
    /**
     * Gets the map of globally available dependencies with their names
     * as keys and their evaluated pilet content as value.
     */
    dependencies?: AvailableDependencies;
    /**
     * Optionally, defines the loading strategy to use.
     */
    strategy?: PiletLoadingStrategy;
  }

  export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

  export interface TileErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "tile";
    /**
     * The provided error details.
     */
    error: any;
    /**
     * The currently used number of columns.
     */
    columns: number;
    /**
     * The currently used number of rows.
     */
    rows: number;
    /**
     * The name of the pilet emitting the error.
     */
    pilet?: string;
  }

  /**
   * The error used when a registered menu item component crashed.
   */
  export interface MenuItemErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "menu";
    /**
     * The provided error details.
     */
    error: any;
    /**
     * The type of the used menu.
     */
    menu: MenuType;
    /**
     * The name of the pilet emitting the error.
     */
    pilet?: string;
  }

  /**
   * The error used when a registered modal dialog crashed.
   */
  export interface ModalErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "modal";
    /**
     * The provided error details.
     */
    error: any;
    /**
     * Callback for closing the modal programmatically.
     */
    onClose(): void;
    /**
     * The name of the pilet emitting the error.
     */
    pilet?: string;
  }

  /**
   * The error used when loading a feed resulted in an error.
   */
  export interface FeedErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "feed";
    /**
     * The provided error details.
     */
    error: any;
    /**
     * The name of the pilet emitting the error.
     */
    pilet?: string;
  }

  /**
   * The creator function for the pilet API.
   */
  export interface PiletApiCreator {
    (target: PiletMetadata): PiletApi;
  }

  /**
   * The interface describing a function capable of fetching pilets.
   */
  export interface PiletRequester {
    (): Promise<Array<PiletMetadata>>;
  }

  /**
   * Additional configuration options for the default loader.
   */
  export interface DefaultLoaderConfig {
    /**
     * Sets the cross-origin attribute of potential script tags.
     * For pilets v1 this may be useful. Otherwise, only pilets that
     * have an integrity defined will be set to "anonymous".
     */
    crossOrigin?: string;
  }

  /**
   * The callback to be used to load a single pilet.
   */
  export interface PiletLoader {
    (meta: PiletMetadata): Promise<Pilet>;
  }

  /**
   * Defines the spec identifiers for custom loading.
   */
  export type CustomSpecLoaders = Record<string, PiletLoader>;

  /**
   * The record containing all available dependencies.
   */
  export interface AvailableDependencies {
    [name: string]: any;
  }

  /**
   * The strategy for how pilets are loaded at runtime.
   */
  export interface PiletLoadingStrategy {
    (options: LoadPiletsOptions, pilets: PiletsLoaded): PromiseLike<void>;
  }

  /**
   * The callback to be used when pilets have been loaded.
   */
  export interface PiletsLoaded {
    (error: Error | undefined, pilets: Array<Pilet>): void;
  }
}