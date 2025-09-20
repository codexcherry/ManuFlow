// Import statements should be at the top of the file
import { EventEmitter } from 'events';

// Define types for events
export type EventType = 
  | 'order:created'
  | 'order:updated'
  | 'order:deleted'
  | 'product:updated'
  | 'stock:changed';

export interface EventPayload {
  type: EventType;
  data: any;
}

/**
 * EventBus - A simple event bus for application-wide events
 * 
 * This class provides a centralized event handling mechanism for the application
 * to enable communication between different components without direct coupling.
 */
class EventBus {
  private emitter: EventEmitter;
  
  constructor() {
    this.emitter = new EventEmitter();
    // Increase max listeners to avoid warnings
    this.emitter.setMaxListeners(20);
  }

  /**
   * Subscribe to an event
   * @param event The event type to subscribe to
   * @param callback The function to call when the event is emitted
   * @returns A function to unsubscribe
   */
  subscribe(event: EventType, callback: (data: any) => void): () => void {
    this.emitter.on(event, callback);
    
    // Return unsubscribe function
    return () => {
      this.emitter.off(event, callback);
    };
  }

  /**
   * Subscribe to an event once
   * @param event The event type to subscribe to
   * @param callback The function to call when the event is emitted
   */
  subscribeOnce(event: EventType, callback: (data: any) => void): void {
    this.emitter.once(event, callback);
  }

  /**
   * Emit an event
   * @param event The event type to emit
   * @param data The data to pass to subscribers
   */
  emit(event: EventType, data: any): void {
    this.emitter.emit(event, data);
  }

  /**
   * Remove all listeners for an event
   * @param event The event type to clear listeners for
   */
  clearListeners(event?: EventType): void {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
  }
}

// Create a singleton instance
const eventBus = new EventBus();

export default eventBus;
