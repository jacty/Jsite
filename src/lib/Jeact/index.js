import {createElement} from '@Jeact/Element'
import {useState} from '@Jeact/Hooks';
import {createRoot} from '@Jeact/vDOM/Root';
import {lazy} from '@Jeact/lazy';
import {JEACT_SUSPENSE_TYPE} from '@Jeact/shared/Constants';

export {
  createElement as J,
  useState,
  createRoot,
  lazy,
  JEACT_SUSPENSE_TYPE as Suspense,
};

