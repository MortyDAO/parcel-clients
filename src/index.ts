/**
 * See main class {@link Parcel}
 *
 * @category Main
 * @module Parcel
 */
import type { App, AppCreateParams, AppId, AppUpdateParams, ListAppsFilter } from './app.js';
import { AppImpl } from './app.js';
import type {
  BackendClientCreateParams,
  BackendClientUpdateParams,
  Client,
  ClientCreateParams,
  ClientId,
  ClientUpdateParams,
  FrontendClientCreateParams,
  FrontendClientUpdateParams,
  ListClientsFilter,
  ServiceClientCreateParams,
  ServiceClientUpdateParams,
} from './client.js';
import { BackendClient, ClientImpl, ClientType, FrontendClient, ServiceClient } from './client.js';
import type { Job, JobId, JobSpec, JobStatus, JobStatusReport } from './compute.js';
import {
  ComputeImpl,
  InputDocumentSpec,
  JobPhase,
  ListJobsFilter,
  OutputDocument,
  OutputDocumentSpec,
} from './compute.js';
import type { Condition } from './condition.js';
import type {
  AccessEvent,
  Document,
  DocumentId,
  DocumentSearchParams,
  DocumentUpdateParams,
  DocumentUploadParams,
  ListAccessLogFilter,
  Storable,
  Upload,
} from './document.js';
import { DocumentImpl } from './document.js';
import type { Grant, GrantCreateParams, GrantId } from './grant.js';
import { Capabilities, GrantImpl, ListGrantsFilter } from './grant.js';
import type { Config as ClientConfig, Download } from './http.js';
import { ApiError, HttpClient } from './http.js';
import type {
  GrantedPermission,
  Identity,
  IdentityCreateParams,
  IdentityId,
  IdentityUpdateParams,
} from './identity.js';
import { IdentityImpl } from './identity.js';
import type { Page, PageParams } from './model.js';
import type { Permission, PermissionCreateParams, PermissionId } from './permission.js';
import { PermissionImpl } from './permission.js';
import type {
  ClientCredentials,
  PrivateJWK,
  PublicJWK,
  RefreshingTokenProviderParams,
  RenewingTokenProviderParams,
  Scope,
  SelfIssuedTokenProviderParams,
  TokenSource,
} from './token.js';
import { TokenProvider, PARCEL_RUNTIME_AUD } from './token.js';

export {
  AccessEvent,
  ApiError,
  App,
  AppCreateParams,
  AppId,
  AppUpdateParams,
  BackendClient,
  BackendClientCreateParams,
  BackendClientUpdateParams,
  Capabilities,
  Client,
  ClientCreateParams,
  ClientCredentials,
  ClientId,
  ClientType,
  Condition,
  Document,
  DocumentId,
  DocumentUpdateParams,
  DocumentUploadParams,
  Download,
  FrontendClient,
  FrontendClientCreateParams,
  FrontendClientUpdateParams,
  Grant,
  GrantCreateParams,
  GrantId,
  GrantedPermission,
  Identity,
  IdentityCreateParams,
  IdentityId,
  IdentityUpdateParams,
  InputDocumentSpec,
  Job,
  JobId,
  JobPhase,
  JobSpec,
  JobStatus,
  JobStatusReport,
  OutputDocument,
  OutputDocumentSpec,
  PARCEL_RUNTIME_AUD,
  Page,
  PageParams,
  Permission,
  PermissionCreateParams,
  PermissionId,
  PrivateJWK,
  PublicJWK,
  RefreshingTokenProviderParams,
  RenewingTokenProviderParams,
  Scope,
  SelfIssuedTokenProviderParams,
  ServiceClient,
  ServiceClientCreateParams,
  ServiceClientUpdateParams,
  Storable,
  TokenSource,
};

/**
 * Example:
 * ```ts
 * import Parcel from '@oasislabs/parcel';
 * const parcel = new Parcel({
 *   clientId: serviceClientId,
 *   privateKey: serviceClientPrivateKey,
 * });
 * console.log(await parcel.searchDocuments());
 * ```
 *
 * @category Main
 */
export class Parcel {
  private currentIdentity?: Identity;
  private readonly client: HttpClient;

  public constructor(tokenSource: TokenSource, config?: Config) {
    const tokenProvider = TokenProvider.fromSource(tokenSource);
    this.client = new HttpClient(tokenProvider, {
      apiUrl: config?.apiUrl,
      httpClientConfig: config?.httpClientConfig,
    });
  }

  public get apiUrl() {
    return this.client.apiUrl;
  }

  public async createIdentity(params: IdentityCreateParams): Promise<Identity> {
    return IdentityImpl.create(this.client, params);
  }

  public async getCurrentIdentity(): Promise<Identity> {
    if (!this.currentIdentity) {
      this.currentIdentity = await IdentityImpl.current(this.client);
    }

    return this.currentIdentity;
  }

  public uploadDocument(data: Storable, params: DocumentUploadParams | undefined | null): Upload {
    return DocumentImpl.upload(this.client, data, params);
  }

  public async getDocument(id: DocumentId): Promise<Document> {
    return DocumentImpl.get(this.client, id);
  }

  public async searchDocuments(
    params?: DocumentSearchParams & PageParams,
  ): Promise<Page<Document>> {
    return DocumentImpl.search(this.client, params);
  }

  public downloadDocument(id: DocumentId): Download {
    return DocumentImpl.download(this.client, id);
  }

  public async getDocumentHistory(
    id: DocumentId,
    filter?: ListAccessLogFilter & PageParams,
  ): Promise<Page<AccessEvent>> {
    return DocumentImpl.history(this.client, id, filter);
  }

  public async updateDocument(id: DocumentId, update: DocumentUpdateParams): Promise<Document> {
    return DocumentImpl.update(this.client, id, update);
  }

  public async deleteDocument(id: DocumentId): Promise<void> {
    return DocumentImpl.delete_(this.client, id);
  }

  public async createApp(params: AppCreateParams): Promise<App> {
    return AppImpl.create(this.client, params);
  }

  public async getApp(id: AppId): Promise<App> {
    return AppImpl.get(this.client, id);
  }

  public async listApps(filter?: ListAppsFilter & PageParams): Promise<Page<App>> {
    return AppImpl.list(this.client, filter);
  }

  public async updateApp(id: AppId, update: AppUpdateParams): Promise<App> {
    return AppImpl.update(this.client, id, update);
  }

  public async deleteApp(id: AppId): Promise<void> {
    return AppImpl.delete_(this.client, id);
  }

  public async createPermission(appId: AppId, params: PermissionCreateParams): Promise<Permission> {
    return PermissionImpl.create(this.client, appId, params);
  }

  public async listPermissions(appId: AppId, filter?: PageParams): Promise<Page<Permission>> {
    return PermissionImpl.list(this.client, appId, filter);
  }

  public async deletePermission(appId: AppId, permissionId: PermissionId): Promise<void> {
    return PermissionImpl.delete_(this.client, appId, permissionId);
  }

  public async createClient(appId: AppId, params: ClientCreateParams): Promise<Client> {
    return ClientImpl.create(this.client, appId, params);
  }

  public async getClient(appId: AppId, clientId: ClientId): Promise<Client> {
    return ClientImpl.get(this.client, appId, clientId);
  }

  public async listClients(
    appId: AppId,
    filter?: ListClientsFilter & PageParams,
  ): Promise<Page<Client>> {
    return ClientImpl.list(this.client, appId, filter);
  }

  public async updateClient(
    appId: AppId,
    clientId: ClientId,
    update: ClientUpdateParams,
  ): Promise<Client> {
    return ClientImpl.update(this.client, appId, clientId, update);
  }

  public async deleteClient(appId: AppId, clientId: ClientId): Promise<void> {
    return ClientImpl.delete_(this.client, appId, clientId);
  }

  public async createGrant(params: GrantCreateParams): Promise<Grant> {
    return GrantImpl.create(this.client, params);
  }

  public async getGrant(id: GrantId): Promise<Grant> {
    return GrantImpl.get(this.client, id);
  }

  public async listGrants(filter?: ListGrantsFilter & PageParams): Promise<Page<Grant>> {
    return GrantImpl.list(this.client, filter);
  }

  public async deleteGrant(id: GrantId): Promise<void> {
    return GrantImpl.delete_(this.client, id);
  }

  /**
   * Enqueues a new job.
   * @param spec Specification for the job to enqueue.
   * @result Job The new job, including a newly-assigned ID.
   */
  public async submitJob(spec: JobSpec): Promise<Job> {
    return ComputeImpl.submitJob(this.client, spec);
  }

  /**
   * Lists all known jobs visible to the current user.
   * @param filter Controls pagination.
   * @result Job Lists known jobs. Includes recently completed jobs.
   */
  public async listJobs(filter: ListJobsFilter & PageParams = {}): Promise<Page<Job>> {
    return ComputeImpl.listJobs(this.client, filter);
  }

  /**
   * Returns the full description of a known job, including its status.
   */
  public async getJob(jobId: JobId): Promise<Job> {
    return ComputeImpl.getJob(this.client, jobId);
  }

  /**
   * Returns the status of the job. This method is faster than `getJob()` and throws if the
   * job status is unknown. This makes it well suited for status polling.
   */
  public async getJobStatus(jobId: JobId): Promise<JobStatusReport> {
    return ComputeImpl.getJobStatus(this.client, jobId);
  }

  /**
   * Schedules the job for eventual termination/deletion. The job will be terminated at some point in the future on a best-effort basis.
   * It is not an error to request to terminate an already-terminated or non-existing job.
   * @param jobId The unique identifier of the job.
   */
  public async terminateJob(jobId: JobId): Promise<void> {
    return ComputeImpl.terminateJob(this.client, jobId);
  }
}

export default Parcel;
export type Config = ClientConfig;
