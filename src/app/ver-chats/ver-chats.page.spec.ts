import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerChatsPage } from './ver-chats.page';

describe('VerChatsPage', () => {
  let component: VerChatsPage;
  let fixture: ComponentFixture<VerChatsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerChatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
