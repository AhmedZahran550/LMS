import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  brand: string;
  deviceType: string;
  osVersion?: string;
}

export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return { brand: 'Unknown', deviceType: 'Unknown' };
  }

  const parser = new UAParser();
  const result = parser.getResult();

  // brand (Browser Name)
  const brand = result.browser.name || 'Unknown Browser';

  // deviceType (mobile, tablet, desktop)
  let deviceType = result.device.type || 'desktop';
  if (deviceType !== 'mobile' && deviceType !== 'tablet' && deviceType !== 'desktop') {
      deviceType = 'desktop';
  }

  // osVersion (OS name + version)
  let osVersion: string | undefined;
  if (result.os.name) {
    osVersion = result.os.name;
    if (result.os.version) {
      osVersion += ` ${result.os.version}`;
    }
  }

  return { brand, deviceType, osVersion };
};
