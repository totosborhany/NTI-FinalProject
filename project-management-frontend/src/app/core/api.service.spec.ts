import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('unwraps the standard API envelope for list requests', () => {
    const expectedProjects = [{ _id: '1', name: 'Alpha' }];

    service.get<Array<{ _id: string; name: string }>>('/projects').subscribe((projects) => {
      expect(projects).toEqual(expectedProjects);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/projects`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'Projects loaded',
      data: expectedProjects,
      meta: {},
      summary: {},
    });
  });

  it('returns direct payloads when the API does not wrap them', () => {
    const expectedUser = { _id: '42', username: 'Ada' };

    service.get<{ _id: string; username: string }>('/users/me').subscribe((user) => {
      expect(user).toEqual(expectedUser);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    req.flush(expectedUser);
  });
});
