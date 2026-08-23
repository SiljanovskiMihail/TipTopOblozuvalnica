import { GlobalRegistrator } from "@happy-dom/global-registrator";

try {
    GlobalRegistrator.register();
} catch (e) {
    // Silence already registered errors
}

