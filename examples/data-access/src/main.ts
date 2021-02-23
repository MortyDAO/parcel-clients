import Parcel, { IdentityId } from '@oasislabs/parcel';
import fs from 'fs';

// #region snippet-config
const acmeId = '0d9f279b-a5d8-7260-e090-ff1a7659ba3b' as IdentityId;
const tokenSource = {
  principal: acmeId,
  privateKey: {
    kty: 'EC',
    alg: 'ES256',
    use: 'sig',
    crv: 'P-256',
    kid: 'DcI1bh_7WW9YujsR3h7dik2rQmYNQPSB3dXV-AJsxgc',
    x: 'v8c_cPZJndQLe51QhGApDPhT4C6OqteK3e0Ttd1CbxE',
    y: 'Cbvi7oyrCfX5iDPiFUiJPtpiGbypB5UoxJviXtBXfNQ',
    d: '9ssmJBm_mDIKpxdB2He-zIMeclYtDGQcBv2glEH7r5k',
  },
} as const;
// #endregion snippet-config

// #region snippet-identity-acme-connect
// Connect to ACME's identity.
const parcel = new Parcel(tokenSource);
// #endregion snippet-identity-acme-connect

// By default, datasets are owned by the uploading identity
// #region snippet-upload-default-owner
const acmeIdentity = await parcel.getCurrentIdentity();
console.log(`Uploading data with identity: ${acmeIdentity.id}`);

const data = 'The weather will be sunny tomorrow and cloudy on Tuesday.';
const datasetDetails = { title: 'Weather forecast summary' };
const acmeDataset = await parcel.uploadDataset(data, {
  details: datasetDetails,
}).finished;
console.log(`Created dataset ${acmeDataset.id} with owner ${acmeDataset.owner}`);
// #endregion snippet-upload-default-owner

// Dataset owners can always download their data
// #region snippet-download-owner
console.log(`Downloading dataset ${acmeDataset.id} with identity ${acmeIdentity.id}`);
let download = parcel.downloadDataset(acmeDataset.id);
let saver = fs.createWriteStream(`./acme_dataset`);
await download.pipeTo(saver);
console.log(`Dataset ${acmeDataset.id} downloaded to ./acme_dataset`);

const acmeData = fs.readFileSync('./acme_dataset', 'utf-8');
console.log(`Here's the data: ${acmeData}`);
// #endregion snippet-download-owner

// Upload a dataset and assign ownership to a sample end user (e.g. "Bob")
// #region snippet-upload-user-data
const bobId = '6cc5defa-af04-512f-6aa3-c13f64d03a8b' as IdentityId; // REPLACE ME
console.log(`Uploading data for end user Bob (ID: ${bobId})`);
const bobDataset = await parcel.uploadDataset(data, {
  details: datasetDetails,
  owner: bobId,
}).finished;
console.log(`Created dataset ${bobDataset.id} with owner ${bobDataset.owner}`);
// #endregion snippet-upload-user-data

// By default, we do not have permission to access data owned by other users
// #region snippet-download-acme-error
download = parcel.downloadDataset(bobDataset.id);
saver = fs.createWriteStream(`./bob_data_by_acme`);
try {
  console.log(`Attempting to access Bob's dataset without permission...`);
  await download.pipeTo(saver);
} catch (error: any) {
  console.log(`ACME was not able to access Bob's data (this was expected): ${error}`);
}
// #endregion snippet-download-acme-error

console.log();

/**
 * At this point, we need Bob to grant us permission to use his data.
 * Specifically, we need to:
 *  - Redirect Bob to steward.oasislabs.com/apps/:id/join
 *  - Have Bob grant us permission
 */

// Now, accessing the dataset succeeds
// #region snippet-download-bob-success
console.log(`Attempting to access Bob's dataset with ACME identity ${acmeIdentity.id}`);
download = parcel.downloadDataset(bobDataset.id);
saver = fs.createWriteStream(`./bob_data_by_acme`);
await download.pipeTo(saver);
console.log(`Dataset ${bobDataset.id} has been downloaded to ./bob_data_by_acme`);

const bobData = fs.readFileSync('./bob_data_by_acme', 'utf-8');
console.log(`Here's the data: ${bobData}`);
// #endregion snippet-download-bob-success

console.log();
