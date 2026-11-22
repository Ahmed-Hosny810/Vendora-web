import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  const announce = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    announce.mockClear();
    TestBed.configureTestingModule({
      providers: [{ provide: LiveAnnouncer, useValue: { announce } }],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => vi.useRealTimers());

  const titles = () => service.toasts().map((t) => t.title);

  it('shows a toast and reads it to screen readers', () => {
    service.success('Saved', { body: 'Latte' });
    expect(titles()).toEqual(['Saved']);
    expect(announce).toHaveBeenCalledWith('Saved. Latte', 'polite');
  });

  it('hides normal toasts after 5 seconds', () => {
    service.info('Sent');
    vi.advanceTimersByTime(5000 + 200);
    expect(titles()).toEqual([]);
  });

  it('keeps errors until closed, and announces them right away', () => {
    service.error('Payment failed');
    expect(announce).toHaveBeenCalledWith('Payment failed', 'assertive');
    vi.advanceTimersByTime(60_000);
    expect(titles()).toEqual(['Payment failed']);
  });

  it('keeps at most 3, dropping the oldest', () => {
    ['a', 'b', 'c', 'd'].forEach((t) => service.info(t));
    expect(titles()).toEqual(['b', 'c', 'd']);
  });

  it('runs the action, then closes the toast', () => {
    const onAction = vi.fn();
    service.error('Failed', { action: 'Retry', onAction });
    service.runAction(service.toasts()[0]);
    expect(onAction).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(200);
    expect(titles()).toEqual([]);
  });
});
